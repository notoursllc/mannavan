<script>
import { mapGetters } from 'vuex';
import {
    FigFormRadio,
    FigButton,
    FigOverlay
} from '@notoursllc/figleaf';
export default {
    name: 'CheckoutShippingRates',

    props: {
        cart: {
            type: Object,
            required: true
        },

        showSelectedRate: {
            type: Boolean,
            default: false
        }
    },

    components: {
        FigFormRadio,
        FigButton,
        FigOverlay
    },

    data() {
        return {
            loading: false,
            rates: [],
            selectedRate: null
        }
    },

    computed: {
        ...mapGetters({
            shippingRateTotal: 'cart/shippingRateTotal',
            shippingRateEstimatedDeliveryDate: 'cart/shippingRateEstimatedDeliveryDate'
        })
    },

    methods: {
        emitDone() {
            this.$emit('done')
        },

        async getShippingRates() {
            this.loading = true;

            try {
                const { data } = await this.$api.cart.shipping.getEstimates(this.cart.id);
                this.rates = data;

                // Hopefully an unlikely scenario, but if no shipping rates were returned
                // then we should probably consider it as 'free' and move on to the next step.
                if(!this.rates.length) {
                    this.continueToPayment();
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

            this.loading = false;
        },

        async continueToPayment() {
            this.loading = true;

            try {
                if(this.selectedRate) {
                    const { data } = await this.$api.cart.shipping.selectRate(
                        this.cart.id,
                        this.selectedRate
                    );

                    this.$store.dispatch('cart/CART', data);
                }

                this.emitDone();
            }
            catch(err) {
                this.$figleaf.errorToast({
                    title: this.$t('An error occurred')
                });

                this.$bugsnag.notify(err);
            }

            this.loading = false;
        },
    },


    mounted() {
        console.log("MOUNTED SHIPPING RATES")
        this.getShippingRates();
    }
}
</script>

<template>
    <fig-overlay :show="loading">
        <div class="text-gray-900 font-semibold mb-2" v-if="rates.length">
            {{ rates.length > 1 ? $t('Choose your shipping speed') : $t('Shipping') }}:
        </div>

        <div>
            <!-- selected rate details -->
            <template v-if="showSelectedRate">
                <template v-if="selectedRate">
                    <div class="inline-block text-black">
                        {{ $n(shippingRateTotal ? shippingRateTotal/100 : 0, 'currency') }}
                    </div>
                    <div class="inline-block text-gray-500 pl-3">
                        {{ cart.selected_shipping_rate ? cart.selected_shipping_rate.service_type : '' }}
                        <!-- {{ $t('Estimated arrival: {date}', { date: translateShippingDate(shippingRateEstimatedDeliveryDate) }) }} -->
                    </div>
                </template>
            </template>

            <!-- rate selection -->
            <template v-else>
                <fig-form-radio
                    v-for="obj in rates"
                    :key="obj.rate_id"
                    name="selectedShipping"
                    :checked-value="obj.rate_id"
                    v-model="selectedRate">
                    <div class="inline-block text-black">
                        {{ $n(obj.shipping_amount.amount, 'currency') }}
                    </div>
                    <div class="inline-block text-gray-500 pl-3">
                        {{ obj.service_type }}
                        <!-- {{ $t('Estimated arrival: {date}', { date: translateShippingDate(obj.estimated_delivery_date) }) }} -->
                    </div>
                </fig-form-radio>

                <div class="mt-4">
                    <fig-button
                        variant="primary"
                        size="md"
                        @click="continueToPayment"
                        :disabled="!selectedRate">{{ $t('Continue to payment') }}</fig-button>
                </div>
            </template>
        </div>
    </fig-overlay>
</template>
