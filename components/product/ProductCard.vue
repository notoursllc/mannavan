<script>
import isObject from 'lodash.isobject';

export default {
    props: {
        product: {
            type: Object,
            default: () => {
                return {};
            }
        },

        maxVariantDisplay: {
            type: Number,
            default: 3
        }
    },

    data() {
        return {
            visibleSku: {
                sku: null,
                featuredImageUrl: null
            },
            showThumbs: false,
            thumbs: {},
            allFeaturedImagesCounter: 0
        };
    },

    computed: {
        thumbOverflowDisplay() {
            if(this.allFeaturedImagesCounter > this.maxVariantDisplay) {
                return `+${this.allFeaturedImagesCounter - this.maxVariantDisplay}`;
            }
            return '';
        }
    },

    watch: {
        product: {
            handler(newVal) {
                if(isObject(newVal) && Array.isArray(newVal.skus)) {
                    for(let i=0, l=newVal.skus.length; i<l; i++) {
                        if(newVal.skus[i].published) {
                            this.setVisibleSku(newVal.skus[i]);
                            break;
                        }
                    }

                    this.setFeaturedImages();
                }

            },
            immediate: true
        }
    },

    methods: {
        setVisibleSku(sku) {
            if(isObject(sku)) {
                this.visibleSku.sku = sku;

                if(Array.isArray(sku.images)) {
                    for(let i=0, l=sku.images.length; i<l; i++) {
                        const img = sku.images[i];

                        if(img.is_featured && img.media) {
                            this.visibleSku.featuredImageUrl = img.media.url;
                            break;
                        }
                    }
                }
            }
            else {
                this.visibleSku.sku = null;
                this.visibleSku.featuredImageUrl = null;
            }
        },

        getSmallestMediaUrl(mediaObj) {
            let smallestWidth;
            let smallestUrl;

            if(isObject(mediaObj)) {
                smallestWidth = mediaObj.width || 9999;
                smallestUrl = mediaObj.url;

                if(Array.isArray(mediaObj.variants)) {
                    mediaObj.variants.forEach((variant) => {
                        if(variant.width < smallestWidth) {
                            smallestWidth = variant.width;
                            smallestUrl = variant.url;
                        }
                    });
                }
            }

            return smallestUrl;
        },

        setFeaturedImages() {
            this.thumbs = [];

            if(!Array.isArray(this.product.skus) || !this.product.skus.length) {
                return;
            }

            let counter = 0;
            let allFeaturedCounter = 0;

            this.product.skus.forEach((sku) => {
                if(Array.isArray(sku.images)) {
                    sku.images.forEach((img) => {
                        if(img.is_featured) {
                            allFeaturedCounter++;

                            if(counter < this.maxVariantDisplay) {
                                this.thumbs.push({
                                    smallestMediaUrl: this.getSmallestMediaUrl(img.media),
                                    smallestImage: img,
                                    sku: sku
                                });
                                counter++;
                            }
                        }
                    });
                }
            });

            this.allFeaturedImagesCounter = allFeaturedCounter;
        },

        onThumbMouseOver(obj) {
            this.setVisibleSku(obj.sku);
        },

        goToProductDetails(skuId) {
            const params = {
                seouri: this.product.seo_uri
            };

            if(skuId) {
                params.sku = skuId;
            }

            this.$router.push({
                name: 'p-seouri',
                params
            });
        }
    }
};
</script>


<template>
    <figure class="pic-card">
        <b-img
            :src="visibleSku.featuredImageUrl"
            fluid-grow
            alt="Fluid-grow image"></b-img>

        <div class="pic-card-content-wrapper">
            <div @click="goToProductDetails">
                <div class="pic-card-title">{{ product.title }}</div>
                <div class="pic-card-subtitle">subtitle</div>
            </div>

            <div class="pic-card-count-wrapper">
                <div v-if="thumbs.length > 1">
                    <template v-if="showThumbs">
                        <div @mouseleave="showThumbs = false">
                            <div v-for="(obj, index) in thumbs"
                                :key="index"
                                class="media-thumb"
                                @click="goToProductDetails(obj.sku.id)">
                                <figure
                                    :id="`thumb_${index}`"
                                    :style="`background-image:url(${obj.smallestMediaUrl});`"
                                    @mouseover="onThumbMouseOver(obj)"></figure>
                                <b-tooltip
                                    :disabled="obj.sku.inventory_count > 0"
                                    :target="`thumb_${index}`">{{ $t('Sold out') }}</b-tooltip>
                            </div>

                            <div class="colorway-overflow">{{ thumbOverflowDisplay }}</div>
                        </div>
                    </template>
                    <template v-else>
                        <div @mouseover="showThumbs = true">
                            {{ $tc('_num_ Variants', allFeaturedImagesCounter, { num: allFeaturedImagesCounter }) }}
                        </div>
                    </template>
                </div>
            </div>

            <div class="pic-card-price" @click="goToProductDetails">${{ visibleSku.sku.base_price }}</div>
        </div>
    </figure>
</template>


<style lang="scss">
    @import "~assets/css/components/_variables.scss";

    .pic-card {
        // background-color: #fff;
        color: #000;
        transition: .3s;
        overflow: hidden;
        position: relative;
        display: block;

        .pic-card-img {
            width: 40px;
            height: 40px;
            background-size: cover;
            background-position: center;
            display: inline-block;
            margin: 0 3px;
        }

        .pic-card-content-wrapper {
            padding: 12px 0 2px;
            // background-color: #fff;
            font-size: 16px;
            font-weight: 500;
            position: relative;
            overflow: hidden;

            .pic-card-alert {
                color: rgb(250, 84, 0);
                font-weight: 400;
            }

            .pic-card-title {
                width: 66%;
            }

            .pic-card-subtitle {
                color: rgb(141,141,141);
                font-size: 16px;
            }

            .pic-card-count-wrapper {
                color: rgb(141,141,141);
                height: 45px;
                margin-top: 10px;
            }

            .pic-card-price {
                position: absolute;
                top: 0;
                right: 0;
                width: 100%;
                padding: 12px 10px 0 0;
                text-align: right;
            }
        }

        .media-thumb {
            margin: 0 3px;
            display: inline-block;

            figure {
                width: 45px;
                height: 45px;
                border-radius: 50px;
                background-size: cover;
                background-position: center;
                display: inline-block;
            }
        }

        .colorway-overflow {
            margin-left: 5px;
            display: inline-block;
            line-height: 40px;
            vertical-align: top;
        }
    }

    // .pic-card-content {
    //     position: absolute;
    //     bottom: 0;
    //     padding: 10px;
    //     background-color: rgba(0,0,0,0.5);
    //     color: #fff;
    //     // height: 40px;
    //     overflow: hidden;
    //     font-size: 14px;
    //     font-weight: 500;
    //     width: 100%;
    // }
</style>
