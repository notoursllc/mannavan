<script>
import isString from 'lodash.isstring';
import {
    FigDropdown,
    FigDropdownButton,
    FigButton,
    FigCurrencySymbol,
    FigUseTime,
    FigUseCountry
} from '@notoursllc/figleaf';


export default {
    components: {
        FigDropdown,
        FigDropdownButton,
        FigButton,
        FigCurrencySymbol
    },

    computed: {
        cartCurrency() {
            const currency = this.$store.state.cart.currency || this.defaultExchangeRate;
            return isString(currency) ? currency.toUpperCase() : '';
        },

        defaultExchangeRate() {
            return this.$store.state.ui.exchangeRates?.default || 'USD';
        },

        exchangeRates() {
            const rates = this.$store.state.ui.exchangeRates?.rates || {};
            let filteredRates = {};

            if(rates && this.cartCurrency) {
                filteredRates = { ...rates };
                delete filteredRates[this.cartCurrency];
            }

            return Object.keys(filteredRates);
        }
    },

    methods: {
        async onExchangeRateClick(val) {
            if(this.exchangeRates.includes(val)) {
                this.$store.dispatch('cart/CART_CURRENCY', val);

                const cartId = this.$store.state.cart.id;

                if(cartId) {
                    try {
                        const { data } = await this.$api.cart.currency({
                            id: cartId,
                            currency: val
                        });

                        await Promise.all([
                            this.$store.dispatch('cart/CART', data.cart),
                            this.$store.dispatch('ui/EXCHANGE_RATES', data.exchange_rates)
                        ]);
                    }
                    catch(err) {
                        // no action
                    }
                }
            }
        }
    },

    mounted() {
        // Set the cart currency to the currency based on the browser's timezone
        // if the cart currency is not already set
        if(!this.$store.state.cart.currency) {
            const { getCountryFromTimezone } = FigUseTime();
            const { getCountryCodeToCurrencyCodeMap } = FigUseCountry();

            const tz = getCountryFromTimezone();
            const countryToCurrencyMap = getCountryCodeToCurrencyCodeMap();
            const currency = countryToCurrencyMap[tz];
            const rates = this.$store.state.ui.exchangeRates?.rates || {};

            if(currency && rates[currency]) {
                this.$store.dispatch('cart/CART_CURRENCY', currency);
            }
        }
    }
};
</script>

<template>
    <fig-dropdown>
        <template v-slot:toggler>
            <fig-button variant="naked">
                <fig-currency-symbol :currency="cartCurrency" /> {{ cartCurrency }}
            </fig-button>
        </template>

        <fig-dropdown-button
            v-for="(rate, idx) in exchangeRates"
            :key="idx"
            @click="onExchangeRateClick(rate)">
            <fig-currency-symbol :currency="rate" /> {{ rate }}
        </fig-dropdown-button>
    </fig-dropdown>
</template>

