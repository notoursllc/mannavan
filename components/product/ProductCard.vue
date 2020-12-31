<script>
import isObject from 'lodash.isobject';
import product_mixin from '@/mixins/product_mixin';
import ProductPrice from '@/components/product/ProductPrice';
import ProductCardThumbs from '@/components/product/ProductCardThumbs';
import VariantAccentMessage from '@/components/product/VariantAccentMessage';
import { isUuid4 } from '@/utils/common';

export default {
    components: {
        ProductPrice,
        ProductCardThumbs,
        VariantAccentMessage
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

        goToProductDetails(variantId) {
            const params = {
                seouri: this.product.seo_uri,
                id: this.product.id
            };

            const query = {};
            if(variantId) {
                query.variant = variantId;
            }

            this.$router.push({
                name: 'p-seouri-id',
                params,
                query
            });
        },

        onCardClick() {
            this.goToProductDetails(this.visibleVariant.variant.id);
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
    <div class="bg-white rounded-md border border-gray-200 cursor-pointer"
         @mouseenter="onCardMouseAction(true)"
         @mouseleave="onCardMouseAction()">

        <figure
            class="bg-white w-full m-0 block"
            @click="onCardClick">

            <nuxt-image
                v-if="visibleVariant.coverImageUrl"
                :placeholder="true"
                :src="visibleVariant.coverImageUrl" />
        </figure>

        <div class="pic-card-info">
            <product-card-thumbs
                v-show="showThumbs"
                :product="product"
                :width="45"
                :limit="maxVariantDisplay"
                @numdisplayed="setNumVisibleThumbs"
                @mouseover="setVisibleVariant"
                @click="(variant) => goToProductDetails(variant.id)" />

            <div v-show="!showThumbs">
                <variant-accent-message
                    :variant="visibleVariant.variant"
                    class="text-orange-600 font-semibold" />

                <div class="text-gray-700 font-semibold">{{ product.title }}</div>
                <div class="text-gray-600">{{ product.caption }}</div>
            </div>

            <div class="text-gray-700 font-semibold pt-3">
                <product-price :sku="visibleVariant.variant" />
            </div>
        </div>
    </div>
</template>


<style lang="postcss">
.pic-card-info {
    @apply p-3 text-base font-semibold relative overflow-hidden;
    min-height: 140px;
}
</style>
