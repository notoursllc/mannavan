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

            if (isObject(this.variant) && this.variant.base_price) {
                price = this.$n(this.variant.base_price, 'currency');

                // if the sku base_price is null then the value is inherited from the parent variant
                if(isObject(this.sku) && this.sku.base_price !== null) {
                    price = this.$n(this.sku.base_price, 'currency');
                }
            }

            return price;
        },

        salePrice: function() {
            let salePrice = null;

            if (isObject(this.variant)) {
                if(this.variant.is_on_sale && this.variant.sale_price !== null) {
                    salePrice = this.$n(this.variant.sale_price, 'currency');
                }

                if(isObject(this.sku)
                    && this.sku.is_on_sale
                    && this.sku.sale_price !== null) {
                    salePrice = this.$n(this.sku.sale_price, 'currency');
                }
            }

            return salePrice;
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


<style lang="postcss" scoped>
.basePrice {
    @apply hidden;
}

@screen sm {
    @apply inline-block;
}
</style>
