<script>
import isObject from 'lodash.isobject';
import ProductPrice from '@/components/product/ProductPrice';
import ProductCardThumbs from '@/components/product/ProductCardThumbs';
import VariantAccentMessage from '@/components/product/VariantAccentMessage';

export default {
    components: {
        ProductPrice,
        ProductCardThumbs,
        VariantAccentMessage
    },

    props: {
        product: {
            type: Object,
            default: () => {
                return {};
            }
        },

        imageLoading: {
            type: String,
            default: 'lazy',
            validator: (value) => ['lazy', 'eager', 'auto'].includes(value)
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
            this.visibleVariant.coverImageUrl = Array.isArray(variant.images) ? variant.images[0].third_party_id : null;
        },

        // getSmallestMediaUrl(mediaObj) {
        //     let smallestWidth;
        //     let smallestUrl;

        //     if(isObject(mediaObj)) {
        //         smallestWidth = mediaObj.width || 9999;
        //         smallestUrl = mediaObj.url;

        //         if(Array.isArray(mediaObj.variants)) {
        //             mediaObj.variants.forEach((variant) => {
        //                 if(variant.width < smallestWidth) {
        //                     smallestWidth = variant.width;
        //                     smallestUrl = variant.url;
        //                 }
        //             });
        //         }
        //     }

        //     return smallestUrl;
        // },

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
    <div
        class="product-card"
        @click="onCardClick"
        @mouseenter="onCardMouseAction(true)"
        @mouseleave="onCardMouseAction()">

        <figure>
            <nuxt-img
                v-if="visibleVariant.coverImageUrl"
                :src="visibleVariant.coverImageUrl"
                provider="cloudflare"
                :loading="imageLoading"
                sizes="lg:575px md:375px sm:500px" />
        </figure>

        <div class="pic-card-info">
            <product-card-thumbs
                v-show="showThumbs"
                :product="product"
                preset="prod_thumb_xs"
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
                <product-price :variant="visibleVariant.variant" />
            </div>
        </div>
    </div>
</template>


<style lang="postcss">
.product-card {
    @apply bg-white rounded-md cursor-pointer;
}

/* https://www.codecaptain.io/blog/web-development/responsive-images-and-preventing-page-reflow/474 */
.product-card > figure {
    @apply w-full m-0 block relative;
    padding-bottom: 100%;
    background: #dceff9;
}

.product-card > figure > img {
    @apply absolute w-full h-full top-0 left-0;
}

.pic-card-info {
    @apply p-3 text-base font-semibold relative overflow-hidden;
    min-height: 140px;
}
</style>
