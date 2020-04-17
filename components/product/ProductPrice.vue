<script>
import isObject from 'lodash.isobject';

export default {
    props: {
        sku: {
            type: Object,
            required: true
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

    computed: {
        basePrice: function() {
            console.log("PROD", this.sku)
            if (isObject(this.sku) && this.sku.base_price) {
                return this.$n(this.sku.base_price, 'currency');
            }

            return 0;
        },

        salePrice: function() {
            if (isObject(this.sku)
                && this.sku.is_on_sale
                && this.sku.sale_price) {
                return this.$n(this.sku.sale_price, 'currency');
            }

            return 0;
        }
    }
};
</script>


<template>
    <div class="inlineBlock">
        <div v-if="salePrice && basePrice && showStrikethrough">
            <div class="colorGrayLighter strikethrough mrs basePrice" :class="{ 'inlineBlock': !stacked }">{{ basePrice }}</div>
            <div class="inlineBlock">{{ salePrice }}</div>
        </div>
        <div v-else-if="salePrice" class="inlineBlock">{{ salePrice }}</div>
        <div v-else class="inlineBlock">{{ basePrice }}</div>
    </div>
</template>

<style lang="scss" scoped>
    @import "~assets/css/components/_variables.scss";

    @media #{$small-and-down} {
        .basePrice {
            display: none;
        }
    }
</style>
