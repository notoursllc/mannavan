<script>
import Currency from '@/components/currency/Currency.vue';
import CartSubTotal from '@/components/cart/CartSubTotal.vue';
import {
    FigTooltip,
    FigIcon,
    FigIconLabel
} from '@notoursllc/figleaf';


export default {
    name: 'CartTotalsTable',

    components: {
        Currency,
        CartSubTotal,
        FigTooltip,
        FigIcon,
        FigIconLabel
    },

    props: {
        cart: {
            type: Object,
            default() {
                return {};
            }
        },

        shipping: {
            type: Boolean,
            default: false
        },

        shippingOnNextStep: {
            type: Boolean,
            default: false
        },

        salesTax: {
            type: Boolean,
            default: false
        },

        salesTaxOnNextStep: {
            type: Boolean,
            default: false
        },

        labelClass: {
            type: String,
            default: null
        }
    },

    data() {
        return {
            totals: {
                sub_total: 0,
                shipping_total: 0,
                sales_tax: 0,
            }
        }
    },

    computed: {
        numCartItems() {
            return this.cart.num_items;
        },

        grandTotal() {
            return this.totals.sub_total + this.totals.shipping_total + this.totals.sales_tax;
        }
    },

    methods: {
        onExchangeRatePrice(key, val) {
            const price = parseInt(val, 10);
            this.totals[key] = !isNaN(price) ? price : 0;
        }
    }
};
</script>


<template>
    <div v-if="numCartItems" class="table w-full text-black">
        <!-- subtotal -->
        <div class="table-row">
            <div class="cart-totals-cell-label" :class="labelClass">
                <fig-icon-label>
                    {{ $t('Subtotal') }}
                    <template slot="right">
                        <fig-tooltip placement="top">
                            <fig-icon
                                slot="toggler"
                                icon="info-circle"
                                :width="16"
                                :height="16" />
                            {{ $t('subtotal_tooltip') }}
                        </fig-tooltip>
                    </template>
                </fig-icon-label>
            </div>
            <div class="cart-totals-cell-value">
                <cart-sub-total
                    :cart="cart"
                    class="font-mono"
                    @exchangeRatePrice="(val) => { onExchangeRatePrice('sub_total', val) }" />
            </div>
        </div>

        <!-- shipping -->
        <div class="table-row" v-if="shipping || shippingOnNextStep">
            <div class="cart-totals-cell-label" :class="labelClass">{{ $t('Shipping') }}</div>
            <div class="cart-totals-cell-value">
                <div v-if="shippingOnNextStep" class="text-xs text-gray-500">{{ $t('calculated at checkout') }}</div>
                <template v-else>
                    <currency
                        class="font-mono"
                        :price="cart.shipping_total"
                        @exchangeRatePrice="(val) => { onExchangeRatePrice('shipping_total', val) }" />
                </template>
            </div>
        </div>

        <!-- sales tax -->
        <div class="table-row" v-if="salesTax || salesTaxOnNextStep">
            <div class="cart-totals-cell-label" :class="labelClass">{{ $t('Estimated tax') }}</div>
            <div class="cart-totals-cell-value">
                <div v-if="salesTaxOnNextStep" class="text-xs text-gray-500">{{ $t('calculated at checkout') }}</div>
                <template v-else>
                    <currency
                        class="font-mono"
                        :price="cart.sales_tax"
                        @exchangeRatePrice="(val) => { onExchangeRatePrice('sales_tax', val) }" />
                </template>
            </div>
        </div>

        <!-- order total -->
        <div class="table-row" v-if="shipping && salesTax">
            <div class="cart-totals-cell-label pt-2 font-medium" :class="labelClass">{{ $t('Order total') }}:</div>
            <div class="cart-totals-cell-value text-green-700 pt-2 font-medium">
                <currency
                    class="font-mono"
                    :price="grandTotal"
                    :apply-exchange-rate="false" />
            </div>
        </div>
    </div>
</template>


<style scoped>
.cart-totals-cell-label {
    @apply table-cell pr-3 pb-2;
}

.cart-totals-cell-value {
    @apply table-cell pb-2 text-right;
}
</style>
