<script>
import isObject from 'lodash.isobject';
import Currency from '@/components/Currency.vue';

export default {
    props: {
        sku: {
            type: Object,
            default: () => {
                return {};
            }
        },

        showStrikethrough: {
            type: Boolean,
            default: true
        },

        stacked: {
            type: Boolean,
            default: false
        }
    },

    components: {
        Currency
    },

    computed: {
        basePrice: function() {
            if(isObject(this.sku)
                && this.sku.base_price !== null) {
                return this.sku.base_price;
            }

            return null;
        },

        salePrice: function() {
            if(isObject(this.sku)
                && this.sku.is_on_sale
                && this.sku.sale_price !== null) {
                return this.sku.sale_price;
            }

            return null;
        }
    }
};
</script>


<template>
    <div class="inline-block">
        <!-- base price (with strikethrough) over sale price -->
        <template v-if="showStrikethrough && salePrice && basePrice">
            <currency
                :price="basePrice"
                tag="div"
                class="text-gray-500 mr-1 line-through hidden"
                :class="{'sm:inline-block': !stacked, 'sm:block': stacked}" />
            <currency :price="salePrice" />
        </template>
        <currency
            v-else-if="salePrice"
            :price="salePrice" />
        <currency
            v-else
            :price="basePrice" />
    </div>
</template>
