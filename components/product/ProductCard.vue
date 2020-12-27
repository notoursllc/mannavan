<script>
import isObject from 'lodash.isobject';
import product_mixin from '@/mixins/product_mixin';
import ProductPrice from '@/components/product/ProductPrice';
import ProductFeaturedImageThumbs from '@/components/product/ProductFeaturedImageThumbs';
import SkuAccentMessage from '@/components/product/SkuAccentMessage';
import { isUuid4 } from '@/utils/common';

export default {
    components: {
        ProductPrice,
        ProductFeaturedImageThumbs,
        SkuAccentMessage
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
            visibleVariant: {
                variant: {},
                coverImageUrl: null,
                accentMessage: null
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
            if(isObject(this.product) && Array.isArray(this.product.variants)) {
                const variants = this.product.variants;

                for(let i=0, l=variants.length; i<l; i++) {
                    if(variants[i].published) {
                        this.setVisibleVariant(variants[i]);
                        break;
                    }
                }
            }
        },

        setVisibleVariant(variant) {
            this.visibleVariant.variant = variant;

            const img = this.prodMix_getVariantCoverImage(variant);

            // find the 600px image variant:
            if(img && Array.isArray(img.variants)) {
                img.variants.forEach((obj) => {
                    if(obj.target_width === 600) {
                        this.visibleVariant.coverImageUrl = obj.url;
                    }
                });
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
            this.goToProductDetails(this.visibleVariant.sku.id);
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

            <picture v-if="visibleVariant.coverImageUrl">
                <PiioElement :path="visibleVariant.coverImageUrl" tag="source" media="(max-width:969px)"></PiioElement>
                <PiioElement :path="visibleVariant.coverImageUrl" tag="img"></PiioElement>
            </picture>
        </figure>

        <div class="pic-card-info">
            <product-featured-image-thumbs
                v-show="showThumbs"
                :product="product"
                :width="45"
                :limit="maxVariantDisplay"
                @numdisplayed="setNumVisibleThumbs"
                @mouseover="setVisibleVariant"
                @click="(sku) => goToProductDetails(sku.id)" />

            <div v-show="!showThumbs">
                <!-- TODO: rename to variant-accent-message -->
                <sku-accent-message
                    :sku="visibleVariant.variant"
                    class="pic-card-accent-msg" />

                <div class="pic-card-title">{{ product.title }}</div>
                <div class="pic-card-caption">{{ product.caption }}</div>
            </div>

            <div class="pic-card-price">
                <product-price :sku="visibleVariant.variant" />
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
        margin: 0;

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
        min-height: 140px;
        // border: 1px solid red;

        .pic-card-alert {
            color: rgb(250, 84, 0);
            font-weight: 400;
        }

        .pic-card-accent-msg {
            color: #FD821B;
            font-weight: 500;
        }

        .pic-card-title,
        .pic-card-price {
            color: $gray-900;
            font-weight: 500;
        }

        .pic-card-caption {
            color: $gray-600;
        }

        .pic-card-price {
            padding-top: 10px;
        }
    }
}
</style>
