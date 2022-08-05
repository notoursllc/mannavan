<script>
export default {
    name: 'Currency',

    props: {
        price: {
            type: Number
        },

        tag: {
            type: String,
            default: 'span'
        }
    },

    computed: {
        defaultExchangeRate() {
            return this.$store.state.ui.exchangeRates?.default || 'USD';
        },

        cartCurrency() {
            return this.$store.state.cart.currency || this.defaultExchangeRate;
        },

        exchangeRate() {
            const rates = this.$store.state.ui.exchangeRates?.rates || {};
            return rates[this.cartCurrency] || 1;
        },

        /*
        * Since prices are in cents, divides by 100 to display
        * as 'dollars', and also applies the exchange rate
        */
        convertedPrice() {
            if(this.price !== null) {
                let p = parseInt(this.price, 10);

                if(p && !isNaN(p)) {
                    p = p / 100;

                    if(this.exchangeRate) {
                        p = p * this.exchangeRate;
                    }

                    return p;
                }
            }

            return null;
        }
    }
};
</script>


<template>
    <i18n-n
        v-if="convertedPrice !== null"
        :tag="tag"
        :value="convertedPrice"
        :format="{ key: 'currency', currency: cartCurrency }"></i18n-n>
</template>
