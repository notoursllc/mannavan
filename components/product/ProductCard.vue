<script>
import isObject from 'lodash.isobject';
import ProductPrice from '@/components/product/ProductPrice';
import ProductCardThumbs from '@/components/product/ProductCardThumbs';
import VariantAccentMessage from '@/components/product/VariantAccentMessage';
import {
    FigNuxtImgBunny,
    FigButton,
    FigIconLabel
} from '@notoursllc/figleaf';

export default {
    components: {
        ProductPrice,
        ProductCardThumbs,
        VariantAccentMessage,
        FigNuxtImgBunny,
        FigButton,
        FigIconLabel
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
                coverImage: {},
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
        },

        visibleVariantSku() {
            return Array.isArray(this.visibleVariant.variant.skus)
                ? this.visibleVariant.variant.skus[0]
                : null
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
            this.visibleVariant.coverImage = Array.isArray(variant.images) ? variant.images[0] : null;
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
                id: this.product.id
            };

            const query = {};
            if(variantId) {
                query.variant = variantId;
            }

            this.$router.push({
                name: 'p-id',
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

        <figure class="rounded-t-md">
            <fig-nuxt-img-bunny
                v-if="visibleVariant.coverImage.url"
                :src="visibleVariant.coverImage.url"
                :alt="visibleVariant.coverImage.alt_text"
                :loading="imageLoading"
                class="rounded-t"
                format="webp"
                sizes="lg:575px md:375px sm:500px" />
        </figure>

        <div class="pic-card-info">
            <product-card-thumbs
                v-show="showThumbs"
                :product="product"
                preset="prodthumbxs"
                :limit="maxVariantDisplay"
                @numdisplayed="setNumVisibleThumbs"
                @mouseover="setVisibleVariant"
                @click="(variant) => goToProductDetails(variant.id)" />

            <div v-show="!showThumbs">
                <variant-accent-message
                    :variant="visibleVariant.variant"
                    class="text-orange-600 font-semibold" />

                <div class="text-gray-700 font-semibold">{{ product.title }}</div>
                <div class="text-gray-500 text-sm font-normal">{{ product.caption }}</div>
            </div>

            <div class="text-gray-700 font-semibold pt-3">
                <product-price :sku="visibleVariantSku" />
            </div>
        </div>

        <!-- <div
            @click="onCardClick"
            class="border-t border-gray-300 flex justify-center py-3 cursor-pointer text-blue-600">
            <fig-icon-label>
                <template v-slot:left>
                    <fig-icon
                        icon="eye"
                        :width="16"
                        :height="16" />
                </template>
                <div class="pl-1">{{ $t('SEE MORE') }}</div>
            </fig-icon-label>
        </div> -->
    </div>
</template>


<style>
.product-card {
    @apply bg-white rounded cursor-pointer;
}

/* https://www.codecaptain.io/blog/web-development/responsive-images-and-preventing-page-reflow/474 */
.product-card > figure {
    @apply w-full m-0 block relative;
    padding-bottom: 100%;
    background: #dceff9;
}

.product-card > figure > img {
    @apply absolute w-full h-auto top-0 left-0;
}

.pic-card-info {
    @apply p-3 text-base font-semibold relative overflow-hidden;
    min-height: 100px;
}
</style>
