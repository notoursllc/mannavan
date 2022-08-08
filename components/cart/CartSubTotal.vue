<script>
import Currency from '@/components/currency/Currency.vue';
import {
    FigUseCurrency
} from '@notoursllc/figleaf';

const { cartSubTotal } = FigUseCurrency();

export default {
    name: 'CartTotalsTable',

    components: {
        Currency
    },

    props: {
        cart: {
            type: Object,
            default() {
                return {};
            }
        }
    },

    computed: {
        cartCurrency() {
            return this.$store.state.cart.currency || 'USD';
        },

        exchangeRateTable() {
            return this.$store.state.ui.exchangeRates?.rates || {};
        },

        exchangeRate() {
            return this.exchangeRateTable[this.cartCurrency] || 1;
        },

        subtotal() {
            return cartSubTotal(this.cart, this.exchangeRate)
        }
    },

    methods: {
        onExchangeRatePrice(val) {
            this.$emit('exchangeRatePrice', val)
        }
    }
};
</script>


<template>
    <currency
        :price="subtotal"
        :apply-exchange-rate="false"
        @exchangeRatePrice="onExchangeRatePrice" />
</template>
