<script>
    import isObject from 'lodash.isobject'

    export default {
        props: {
            product: {
                type: Object,
                required: true
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
        <div class="inlineBlock" v-if="salePrice && basePrice">
            <div class="inlineBlock colorGrayLighter strikethrough mrs">{{ basePrice }}</div>
            <div class="inlineBlock">{{ salePrice }}</div>
        </div> 
        <div v-else-if="salePrice" class="inlineBlock">{{ salePrice }}</div>
        <div v-else class="inlineBlock">{{ basePrice }}</div>
    </div>
</template>