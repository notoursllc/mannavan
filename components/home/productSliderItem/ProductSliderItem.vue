

<script>
import isObject from 'lodash.isobject';
import ProductPrice from '@/components/product/ProductPrice';
import ProductCardThumbs from '@/components/product/ProductCardThumbs';
import VariantAccentMessage from '@/components/product/VariantAccentMessage';
import { FigNuxtImgBunny } from '@notoursllc/figleaf';


export default {
    name: 'ProductSliderItem',

    components: {
        ProductPrice,
        ProductCardThumbs,
        VariantAccentMessage,
        FigNuxtImgBunny
    },

    props: {
        product: {
            name: String,
            title: String,
            overview: String,
            backdrop_path: String,
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
            this.visibleVariant.coverImageUrl = Array.isArray(variant.images) ? variant.images[0].url : null;
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

        setNumVisibleThumbs(num) {
            this.numVisibleThumbs = num;
        }
    }
}
</script>


<template>
    <div
        class="product-slider-item"
        @click="onCardClick">

        <div
            class="product-slider-pic"
            :style="{ backgroundImage: `url(https://bv-pullzone-1.b-cdn.net/${visibleVariant.coverImageUrl}?class=w500)` }">

            <div class="product-slider-pic-details">
                <h3 class="text-white mb-1">
                    {{ product.title || product.name }}
                </h3>
            </div>
        </div>

        <div class="bg-white py-1 px-2" style="height:100px;">
            <product-card-thumbs
                :product="product"
                preset="prodthumbxs"
                :limit="maxVariantDisplay"
                @numdisplayed="setNumVisibleThumbs"
                @mouseover="setVisibleVariant"
                @click="(variant) => goToProductDetails(variant.id)" />

            <div>
                <variant-accent-message
                    :variant="visibleVariant.variant"
                    class="text-orange-600 font-semibold" />

                <div class="text-gray-700 font-semibold">{{ product.title }}</div>
                <!-- <div class="text-gray-600">{{ product.caption }}</div> -->
            </div>

            <div class="text-gray-700 font-semibold pt-3">
                <product-price :variant="visibleVariant.variant" />
            </div>

        </div>

    </div>
</template>


<style>
.product-slider-item {
    @apply border-2 border-transparent my-0 mx-1;

}
.product-slider-pic {
    @apply bg-cover bg-no-repeat bg-center rounded-t-sm;
    height: 20rem;
}

.product-slider-pic-details {
    @apply h-full flex flex-col justify-end py-2 px-4 opacity-100 sm:opacity-0 invisible transition-all ease-in-out duration-300 rounded-b-sm;
}
</style>
