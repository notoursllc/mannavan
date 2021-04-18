<script>
import isObject from 'lodash.isobject';

export default {
    props: {
        variant: {
            type: Object,
            required: true
        },

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

    computed: {
        basePrice: function() {
            let price = null;

            if (isObject(this.variant) && this.variant.base_price !== null) {
                price = this.variant.base_price;
            }
            console.log("this.variant.base_price", this.variant.base_price)

            // The SKU data gets prescident if it exists
            if(isObject(this.sku) && this.sku.base_price !== null) {
                price = this.sku.base_price;
            }

            return this.formatPrice(price);
        },

        salePrice: function() {
            let price = null;

            if (isObject(this.variant)
                && this.variant.is_on_sale
                && this.variant.sale_price !== null) {
                price = this.variant.sale_price;
            }

            // The SKU data gets prescident if it exists
            if(isObject(this.sku)
                && this.sku.is_on_sale
                && this.sku.sale_price !== null) {
                price = this.sku.sale_price;
            }

            return this.formatPrice(price);
        }
    },

    methods: {
        formatPrice(price) {
            if(price !== null) {
                price = parseInt(price, 10);

                if(price && !isNaN(price)) {
                    return this.$n(price/100, 'currency');
                }
            }

            return null;
        }
    },


    render: function(h) {
        if(this.showStrikethrough && this.salePrice && this.basePrice) {
            return h(
                'div',
                {},
                [
                    h(
                        'div',
                        {
                            class: {
                                'text-gray-500 mr-1 line-through basePrice': true,
                                'inline-block': !this.stacked
                            }
                        },
                        this.basePrice
                    ),
                    h(
                        'div',
                        {
                            class: 'inline-block'
                        },
                        this.salePrice
                    )
                ]
            );
        }
        else if(this.salePrice) {
            return h(
                'span',
                {},
                this.salePrice
            );
        }
        else {
            return h(
                'span',
                {},
                this.basePrice
            );
        }
    }
};
</script>


<style scoped>
.basePrice {
    @apply hidden;
}

@screen sm {
    .basePrice {
        @apply inline-block;
    }
}
</style>
