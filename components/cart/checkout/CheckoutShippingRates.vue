<script>
import { mapGetters } from 'vuex';
import { parseIso8601 } from '@/utils/common';
import CheckoutDeliveryEstimate  from '@/components/cart/checkout/CheckoutDeliveryEstimate.vue';
import Currency from '@/components/Currency.vue';
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
        FigOverlay,
        Currency,
        CheckoutDeliveryEstimate
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
        }),

        buttonDisabled() {
            return (this.rates.length && !this.selectedRate) ? true : false;
        }
    },

    methods: {
        async getShippingRates() {
            this.loading = true;

            try {
                const { data } = await this.$api.cart.shipping.getEstimates(this.cart.id);
                this.rates = data;

                // Hopefully an unlikely scenario, but if no shipping rates were returned
                // then we should probably consider it as 'free' and move on to the next step.
                if(!this.rates.length) {
                    this.selectedRate = null;
                    await this.continueToPayment();
                    return;
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
                const { data } = await this.$api.cart.shipping.selectRate(
                    this.cart.id,
                    this.selectedRate
                );

                this.selectedRate = null;
                this.$emit('done', data);
            }
            catch(err) {
                this.$figleaf.errorToast({
                    title: this.$t('An error occurred')
                });

                this.$bugsnag.notify(err);
            }

            this.loading = false;
        },

        translateShippingDate(isoDate) {
            const parsed = parseIso8601(isoDate);

            if(parsed.month && parsed.day) {
                return this.$t(`month_${parsed.month}_short`) + ' ' + parsed.day;
            }
        }
    },

    mounted() {
        this.getShippingRates();
    }
}
</script>

<template>
    <fig-overlay :show="loading">
        <div class="text-gray-900 font-semibold mb-2 mt-4" v-if="rates.length">
            {{ rates.length > 1 ? $t('Choose your shipping speed') : $t('Shipping') }}:
        </div>

        <div>
            <!-- selected rate details -->
            <template v-if="showSelectedRate">
                <template v-if="cart.selected_shipping_rate">
                    <div class="inline-block text-black">
                        <currency :price="shippingRateTotal" />
                    </div>
                    <div class="inline-block text-gray-500 pl-3">
                        <checkout-delivery-estimate
                            :arrival-date="shippingRateEstimatedDeliveryDate" />
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
                    <div class="flex items-center">
                        <div class="text-black">
                            <currency :price="obj.shipping_amount.amount * 100" />
                        </div>
                        <div class="text-gray-500 pl-3">
                            <checkout-delivery-estimate
                                :arrival-date="obj.estimated_delivery_date" />
                        </div>
                    </div>
                </fig-form-radio>

                <div class="mt-4">
                    <fig-button
                        variant="primary"
                        size="md"
                        @click="continueToPayment"
                        :disabled="buttonDisabled">{{ $t('Continue to payment') }}</fig-button>
                </div>
            </template>
        </div>
    </fig-overlay>
</template>
