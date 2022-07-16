<script>
export default {
    name: 'CheckoutShippingRates',

    props: {
        cart: {
            type: Object,
            required: true,
            selectedRate: null,
            showDetails: false
        }
    },

    data() {
        return {
            loading: false,
            rates: []
        }
    },

    methods: {
        emitSelected(data) {
            this.$emit('selected', data)
        },

        async getShippingRates() {
            this.loading = true;

            try {
                const { data } = await this.$api.cart.shipping.getEstimates(this.cart.id);
                this.rates = data;

                // Hopefully an unlikely scenario, but if no shipping rates were returned
                // then we should probably consider it as 'free' and move on to the next step.
                if(!this.rates.length) {
                    this.emitSelected();
                    return;
                    // this.continueToPayment();
                }

                if(this.rates.length === 1) {
                    this.selectedRate = this.rates[0].rate_id;
                }
            }
            catch(err) {
                this.$figleaf.errorToast({
                    title: this.$t('A server error occurred while setting the shipping rates'),
                    text: err.message
                });

                this.$bugsnag.notify(err);
            }

            this.shippingRates.loading = false;
        },
    },


    mounted() {
        console.log("MOUNTED SHIPPING RATED")
    }
}
</script>

<template>
    <div>
        TEST SHIPPING RATES
    </div>
</template>
