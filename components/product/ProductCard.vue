<script>
import isObject from 'lodash.isobject';
import product_mixin from '@/mixins/product_mixin';

export default {
    mixins: [
        product_mixin
    ],

    props: {
        product: {
            type: Object,
            default: () => {
                return {};
            }
        },

        maxVariantDisplay: {
            type: Number,
            default: 4
        }
    },

    data() {
        return {
            visibleSku: {
                sku: null,
                featuredImageUrl: null
            },
            showThumbs: false,
            thumbs: {}
        };
    },

    computed: {
        thumbOverflowDisplay() {
            if(this.numProductSkus > this.maxVariantDisplay) {
                return `+${this.numProductSkus - this.maxVariantDisplay}`;
            }
            return '';
        },

        numProductSkus() {
            return this.product.skus.length;
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
            this.visibleSku.sku = isObject(sku) ? sku : null;

            const img = this.prodMix_getFeaturedImageForSku(sku);

            // no need to get a variant, the main image (600px wide) should be good:
            this.visibleSku.featuredImageUrl = isObject(img) && img.media ? img.media.url : null;
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

            this.product.skus.forEach((sku) => {
                if(counter < this.maxVariantDisplay) {
                    const img = this.prodMix_getFeaturedImageForSku(sku);

                    if(isObject(img) && img.media) {
                        this.thumbs.push({
                            smallestMediaUrl: this.getSmallestMediaUrl(img.media),
                            smallestImage: img,
                            sku: sku
                        });
                        counter++;
                    }
                }
            });
        },

        onThumbMouseOver(obj) {
            this.setVisibleSku(obj.sku);
        },

        goToProductDetails(skuId) {
            const params = {
                seouri: this.product.seo_uri,
                id: this.product.id
            };

            const query = {};
            if(skuId) {
                query.sku = skuId;
            }

            this.$router.push({
                name: 'p-seouri-id',
                params,
                query
            });
        },

        onCardClick() {
            this.goToProductDetails(this.visibleSku.sku.id);
        }
    }
};
</script>


<template>
    <figure class="pic-card" @click="onCardClick">
        <b-img
            :src="visibleSku.featuredImageUrl"
            fluid-grow></b-img>

        <div class="pic-card-content-wrapper">
            <div>
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
                            {{ $tc('_num_ Variants', numProductSkus, { num: numProductSkus }) }}
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
