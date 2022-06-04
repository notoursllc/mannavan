<script>
import isObject from 'lodash.isobject';
import { getProductVariantCoverImage } from '@/utils/product';
import ProductPrice from '@/components/product/ProductPrice';
import { FigNuxtImgBunny } from '@notoursllc/figleaf';

export default {
    components: {
        ProductPrice,
        FigNuxtImgBunny
    },

    props: {
        item: {
            type: Object,
            default: null
        },

        imageLoading: {
            type: String,
            default: 'eager',
            validator: (value) => ['lazy', 'eager', 'auto'].includes(value)
        }
    },

    computed: {
        selectedColor() {
            return isObject(this.item.product_variant) ? this.item.product_variant.label : null;
        },

        selectedSize() {
            return isObject(this.item.product_variant_sku) ? this.item.product_variant_sku.label : null;
        },

        coverImage() {
            return getProductVariantCoverImage(this.item.product_variant);
        }
    }
};
</script>


<template>
    <article class="flex items-start w-full my-2">
        <!-- pic -->
        <div class="mr-2 sm:mr-4">
            <fig-nuxt-img-bunny
                v-if="coverImage"
                :src="coverImage"
                preset="prodthumb"
                :loading="imageLoading" />
        </div>

        <div class="flex-grow text-sm">
            <!-- title -->
            <div class="font-semibold mb-1">{{ item.product.title }}</div>

            <!-- color -->
            <div v-if="selectedColor" class="text-gray-600">
                {{ $t('Color') }}: {{ selectedColor }}
            </div>

            <!-- selected size -->
            <div v-if="selectedSize" class="text-gray-600">
                {{ $t('Size') }}: {{ selectedSize }}
            </div>

            <!-- quantity -->
            <div class="text-gray-600">
                {{ $t('Qty') }}: {{ $n(item.qty) }}
                @ <product-price
                    :variant="item.product_variant"
                    :sku="item.product_variant_sku" />
            </div>
        </div>
    </article>
</template>
