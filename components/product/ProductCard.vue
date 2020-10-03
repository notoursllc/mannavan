<script>
import isObject from 'lodash.isobject';
import product_mixin from '@/mixins/product_mixin';
import ProductPrice from '@/components/product/ProductPrice';
import ProductFeaturedImageThumbs from '@/components/product/ProductFeaturedImageThumbs';

export default {
    components: {
        ProductPrice,
        ProductFeaturedImageThumbs
    },

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
                sku: {},
                featuredImageUrl: null
            },
            showThumbs: false,
            numVisibleThumbs: 0
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
            handler() {
                this.init();
            },
            immediate: true
        }
    },

    methods: {
        init() {
            if(isObject(this.product) && Array.isArray(this.product.skus)) {
                const skus = this.product.skus;

                for(let i=0, l=skus.length; i<l; i++) {
                    if(skus[i].published) {
                        this.setVisibleSku(skus[i]);
                        break;
                    }
                }
            }
        },

        setVisibleSku(sku) {
            this.visibleSku.sku = isObject(sku) ? sku : {};

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
        },

        onCardMouseAction(isEnter) {
            this.showThumbs = this.numVisibleThumbs ? !!isEnter : false;
        },

        setNumVisibleThumbs(num) {
            this.numVisibleThumbs = num;
        }
    }
};
</script>


<template>
    <div class="pic-card-wrap"
         @mouseenter="onCardMouseAction(true)"
         @mouseleave="onCardMouseAction()">

        <figure
            class="pic-card"
            @click="onCardClick">

            <picture v-if="visibleSku.featuredImageUrl">
                <PiioElement :path="visibleSku.featuredImageUrl" tag="source" media="(max-width:969px)"></PiioElement>
                <PiioElement :path="visibleSku.featuredImageUrl" tag="img"></PiioElement>
            </picture>
        </figure>

        <div class="pic-card-info">
            <product-featured-image-thumbs
                v-show="showThumbs"
                :product="product"
                :width="45"
                :limit="maxVariantDisplay"
                @numdisplayed="setNumVisibleThumbs"
                @mouseover="setVisibleSku"
                @click="(sku) => goToProductDetails(sku.id)" />

            <div v-show="!showThumbs">
                <div class="pic-card-title">{{ product.title }}</div>
                <div class="pic-card-caption">{{ product.caption }}</div>
            </div>

            <div class="pic-card-price">
                <product-price :sku="visibleSku.sku" />
            </div>
        </div>
    </div>
</template>


<style lang="scss">
@import "~assets/css/components/_variables.scss";

.pic-card-wrap {
    cursor: pointer;
    background-color: #fff;
    border: 1px solid #e6e6e6;
    border-radius: 3px;

    // .pic-card {
    //     color: #000;
    //     transition: .3s;
    //     overflow: hidden;
    //     position: relative;
    //     display: block;
    //     border-radius: 3px;
    //     padding-bottom: 75%;
    //     height: 0;
    //     margin: 0;
    // }
    .pic-card {
        transition: .3s;
        display: block;
        width: 100%;
        background: #fff;

        img {
            width: 100%;
            display: block;
        }
    }

    .pic-card-info {
        padding: 10px;
        font-size: 16px;
        font-weight: 500;
        position: relative;
        overflow: hidden;
        min-height: 120px;
        // border: 1px solid red;

        .pic-card-alert {
            color: rgb(250, 84, 0);
            font-weight: 400;
        }

        .pic-card-title,
        .pic-card-price {
            color: $gray-900;
            font-weight: 500;
        }

        .pic-card-caption {
            color: $gray-600;
            font-size: 16px;
        }

        .pic-card-price {
            padding-top: 10px;
        }
    }
}
</style>
