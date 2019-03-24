<script>
    import isObject from 'lodash.isobject'

    export default {
        props: {
            product: {
                type: Object,
                required: true
            },

            // TODO: still needs implementation in template
            showStrikethrough: {
                type: Boolean,
                default: true
            }
        },

        computed: {
            basePrice: function() {
                if (isObject(this.product) && this.product.base_price) {
                    return this.$n(this.product.base_price, 'currency');
                }

                return 0;
            },

            salePrice: function() {
                if (isObject(this.product)
                    && this.product.is_on_sale
                    && this.product.sale_price) {
                        return this.$n(this.product.sale_price, 'currency');
                }

                return 0;
            }
        }
    }
</script>


<template>
    <div class="inlineBlock">
        <div v-if="salePrice && basePrice">
            <div class="colorGrayLighter strikethrough mrs basePrice">{{ basePrice }}</div>
            <div>{{ salePrice }}</div>
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
