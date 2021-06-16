<script>
import isObject from 'lodash.isobject';
import ProductPrice from '@/components/product/ProductPrice';
import ProductVariantCoverImage from '@/components/product/ProductVariantCoverImage';

export default {
    components: {
        ProductPrice,
        ProductVariantCoverImage
    },

    props: {
        item: {
            type: Object,
            default: null
        }
    },

    computed: {
        selectedColor() {
            return isObject(this.item.product_variant) ? this.item.product_variant.label : null;
        },

        selectedSize() {
            return isObject(this.item.product_variant_sku) ? this.item.product_variant_sku.label : null;
        }
    }
};
</script>


<template>
    <article class="flex items-start w-full my-2">
        <!-- pic -->
        <div class="mr-2 sm:mr-4">
            <product-variant-cover-image
                :variant="item.product_variant"
                smallest />
        </div>

        <div class="flex-grow text-sm">
            <!-- title -->
            <div class="font-semibold mb-1">{{ item.product.title }}</div>

            <!-- color -->
            <div class="text-gray-600">
                {{ $t('Color') }}: {{ selectedColor }}
            </div>

            <!-- selected size -->
            <div class="text-gray-600">
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
