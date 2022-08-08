<script>
import {
    FigCurrency
} from '@notoursllc/figleaf';

export default {
    name: 'Currency',

    props: {
        price: {
            type: Number
        },

        tag: {
            type: String,
            default: 'span'
        },

        applyExchangeRate: {
            type: Boolean,
            default: true
        }
    },

    components: {
        FigCurrency
    },

    computed: {
        defaultExchangeRate() {
            return this.$store.state.ui.exchangeRates?.default || 'USD';
        },

        cartCurrency() {
            return this.$store.state.cart.currency || this.defaultExchangeRate;
        },

        exchangeRateTable() {
            return this.$store.state.ui.exchangeRates?.rates || {};
        }
    },

    methods: {
        onExchangeRatePrice(val) {
            this.$emit('exchangeRatePrice', val);
        }
    }
};
</script>


<template>
    <fig-currency
        :price="price"
        :currency="cartCurrency"
        :exchange-rates="exchangeRateTable"
        :apply-exchange-rate="applyExchangeRate"
        :tag="tag"
        @exchangeRatePrice="onExchangeRatePrice" />
</template>
