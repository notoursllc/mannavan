<script>
import { mapGetters } from 'vuex';
import CartTotalsTable from '@/components/cart/CartTotalsTable';
import CartItemMini from '@/components/cart/CartItemMini';
import CheckoutAddressForm from '@/components/cart/CheckoutAddressForm.vue';
import CartShippingAddressDetails from '@/components/cart/CartShippingAddressDetails.vue';
import CheckoutShippingRates from '@/components/cart/CheckoutShippingRates.vue';
import { parseIso8601 } from '@/utils/common';
import {
    FigButton,
    FigOverlay,
    FigTextCard,
    FigCartCtaLayout,
    FigDivider,
    FigAddress,
    FigFormRadio,
    FigIcon,
    FigIconLabel,
    FigFormCheckbox,
    FigAddressForm,
    FigStripeForm,
    FigPaymentTypeChooser,
    FigContent,
    FigModal,
} from '@notoursllc/figleaf';

import { loadStripe } from '@stripe/stripe-js/pure';
loadStripe.setLoadParameters({ advancedFraudSignals: false }) // https://github.com/stripe/stripe-js#disabling-advanced-fraud-detection-signals


const addressFormBase = {
    firstName: null,
    lastName: null,
    streetAddress: null,
    extendedAddress: null,
    countryCodeAlpha2: null,
    city: null,
    state: null,
    postalCode: null
};


export default {
    components: {
        FigButton,
        FigOverlay,
        FigTextCard,
        FigCartCtaLayout,
        FigDivider,
        FigAddress,
        FigFormRadio,
        FigIcon,
        FigIconLabel,
        FigFormCheckbox,
        FigAddressForm,
        FigStripeForm,
        FigPaymentTypeChooser,
        FigContent,
        FigModal,
        CartTotalsTable,
        CartItemMini,
        CheckoutAddressForm,
        CartShippingAddressDetails,
        CheckoutShippingRates
    },

    data: function() {
        return {
            loading: false,
            step: 1,
            Stripe: null,
            cart: {},
            shippingRates: {
                loading: false,
                rates: [],
                selectedRate: null,
                showDetails: false
            },
            billingForm: {
                isInvalid: true,
                form: {
                    ...addressFormBase
                }
            },
            payment: {
                loading: false,
                billing_same_as_shipping: true,
                stripeFormIsValid: false,
                paymentType: 'cc'
            }
        };
    },

    head() {
        return {
            title: this.$t('Checkout'),
            meta: [
                { vmid: 'description', name: 'description', content: `Your Shopping Cart at ${this.$store.state.ui.siteName}` }
            ]
        };
    },

    computed: {
        ...mapGetters({
            shippingRateTotal: 'cart/shippingRateTotal',
            shippingRateEstimatedDeliveryDate: 'cart/shippingRateEstimatedDeliveryDate'
        }),

        numCartItems() {
            return this.$store.state.cart.num_items;
        },

        canShowPlaceOrderButton() {
            return (this.payment.billing_same_as_shipping || !this.billingForm.isInvalid) && this.payment.stripeFormIsValid;
        }
    },

    async mounted() {
        this.Stripe = await loadStripe(this.$config.stripePublishableKey);
        await this.getCart();
    },

    methods: {
        translateShippingDate(isoDate) {
            const parsed = parseIso8601(isoDate);

            if(parsed.month && parsed.day) {
                return this.$t(`month_${parsed.month}_short`) + ' ' + parsed.day;
            }
        },

        /**
         * Steps:
         * 1) Shipping form view
         * 2) Shipping details view && shipping rate selection view
         * 3) Payment form view
         */
        goToStep(stepNumber) {
            this.step = stepNumber;
        },

        onStripeFormValid(isValid) {
            this.payment.stripeFormIsValid = isValid;
        },

        onStripeTokenGenerated(token) {
            console.log("onStripeTokenGenerated", token)
            //TODO: send token to server
        },

        onBillingAddressFormInvalid(isInvalid) {
            this.billingForm.isInvalid = isInvalid;
        },

        async continueToPayment() {
            this.shippingRates.loading = true;

            try {
                if(this.shippingRates.selectedRate) {
                    const { data } = await this.$api.cart.shipping.selectRate(
                        this.$store.state.cart.id,
                        this.shippingRates.selectedRate
                    );

                    this.$store.dispatch('cart/CART', data);
                }

                this.goToStep(3);
            }
            catch(err) {
                this.$figleaf.errorToast({
                    title: this.$t('An error occurred')
                });

                this.$bugsnag.notify(err);
            }

            this.shippingRates.loading = false;
        },

        onCheckoutAddressFormDone(updatedCart) {
            this.cart = { ...updatedCart };
            this.goToStep(2);
            this.getShippingRates();
        },

        saveBillingForm() {
            try {
                // If billing is the same as shipping then
                // set all billing form values to null
                if(this.payment.billing_same_as_shipping) {
                    this.billingForm.form = {
                        ...addressFormBase
                    };
                }

                // append 'billing_' to all of the keys
                const billingData = {
                    billing_same_as_shipping: this.payment.billing_same_as_shipping
                };
                for(const key in this.billingForm.form) {
                    billingData[`billing_${key}`] = this.billingForm.form[key];
                }

                return this.$api.cart.update({
                    id: this.$store.state.cart.id,
                    ...billingData
                });
            }
            catch(err) {
                console.error('ERR', err);

                this.$figleaf.errorToast({
                    title: this.$t('Error')
                    // text: err.response.data.message
                });

                this.$bugsnag.notify(err);
            }
        },

        // async getShippingRates() {
        //     this.shippingRates.loading = true;

        //     try {
        //         const { data } = await this.$api.cart.shipping.getEstimates(this.$store.state.cart.id);
        //         this.shippingRates.rates = data;

        //         // Hopefully an unlikely scenario, but if no shipping rates were returned
        //         // then we should probably consider it as 'free' and move on to the next step.
        //         if(!this.shippingRates.rates.length) {
        //             this.continueToPayment();
        //         }
        //         else if(this.shippingRates.rates.length === 1) {
        //             this.shippingRates.selectedRate = this.shippingRates.rates[0].rate_id;
        //         }
        //     }
        //     catch(err) {
        //         this.$figleaf.errorToast({
        //             title: this.$t('A server error occurred while setting the shipping rates'),
        //             text: err.message
        //         });

        //         this.$bugsnag.notify(err);
        //     }

        //     this.shippingRates.loading = false;
        // },

        async onClickPlaceOrder(cardElement) {
            this.payment.loading = true;

            // this may be a second attempt at processing payment
            // if the first attempt resulted in an error, so closing
            // any previous message instances
            this.$figleaf.clearToasts();


            const cartId = this.$store.state.cart.id;

            try {
                // first save the billing data
                await this.saveBillingForm();

                const { data } = await this.$api.cart.payment.intent(cartId);

                const stripeResponse = await this.sendStripeCardPayment(
                    data.clientSecret,
                    cardElement
                );

                // console.log("STRIPE RESPONSE", stripeResponse);

                if(stripeResponse.error) {
                    this.$figleaf.errorToast({
                        title: this.$t('An error occurred when processing your card'),
                        text: stripeResponse.error ? stripeResponse.error.message : null
                    });
                }
                else {
                    await this.$api.cart.payment.success(
                        cartId,
                        stripeResponse.paymentIntent.id
                    );

                    this.afterTransactionSuccess();
                }
            }
            catch(err) {
                this.$figleaf.errorToast({
                    title: this.$t('An error occurred'),
                    text: err.message
                });

                this.$bugsnag.notify(err);
            }

            this.payment.loading = false;
        },

        sendStripeCardPayment(clientSecret, cardElement) {
            // const billingAddressSource = this.payment.billing_same_as_shipping ? this.shippingForm.form : this.billingForm.form;

            return this.Stripe.confirmCardPayment(
                clientSecret,
                {
                    payment_method: {
                        card: cardElement,

                        //https://stripe.com/docs/api/payment_methods/create#create_payment_method-billing_details
                        // billing_details: {
                        //     address: {
                        //         city: billingAddressSource.city,
                        //         country: billingAddressSource.countryCodeAlpha2,
                        //         line1: billingAddressSource.streetAddress,
                        //         line2: billingAddressSource.extendedAddress,
                        //         postal_code: billingAddressSource.postalCode,
                        //         state: billingAddressSource.state
                        //     },
                        //     name: `${billingAddressSource.firstName} ${billingAddressSource.lastName}`.trim()
                        //     // email: null,
                        //     // phone: null
                        // },

                        // https://stripe.com/docs/api/payment_methods/create#create_payment_method-metadata
                        metadata: {
                            cart_id: this.cart.id
                        }
                    }
                    // receipt_email: 'gregbruins@gmail.com'
                }
            );
        },

        paypalCompleted(data) {
            // console.log("paypalCompleted", data);
            return this.afterTransactionSuccess();
        },

        paypalCancelled(data) {
            // console.log("paypalCancelled", data);
        },

        paypalError(data) {
            this.$figleaf.errorToast({
                title: this.$t('Error'),
                text: this.$t('An error occurred while processing the PayPal transaction')
            });
        },

        async afterTransactionSuccess() {
            const cartId = this.$store.state.cart.id;
            await this.$store.dispatch('cart/CART_RESET');

            return this.$router.push({
                name: 'order-id',
                params: { id: cartId }
            });
        },

        async getCart() {
            if(this.$store.state.cart.id) {
                this.loading = true;

                const { data } = await this.$api.cart.get({
                    id: this.$store.state.cart.id,
                    _withRelated: '*'
                });

                this.cart = data;
                this.$store.dispatch('cart/CART', this.cart);
                this.loading = false;
            }
        }
    }
};
</script>

<template>
    <fig-content size="lg" class="pt-6">

        <div v-if="!numCartItems" class="text-center text-lg">
            {{ $t('Your shopping cart does not contain any items.') }}
        </div>

        <fig-cart-cta-layout
            v-else
            right-first-on-break>
            <template slot="left">

                <!-- DELIVERY OPTIONS CARD-->
                <fig-text-card variant="dark" class="mb-4">
                    <div slot="header-left" class="flex items-center font-semibold p-1 uppercase">
                        <fig-icon
                            v-if="step === 3"
                            icon="check-circle"
                            :width="24"
                            :height="24"
                            variant="success"
                            class="mr-2" />
                        1. {{ $t('Delivery options') }}
                    </div>

                    <fig-button
                        v-if="step > 1"
                        slot="header-right"
                        variant="plain"
                        size="sm"
                        @click="goToStep(1)">{{ $t('Edit') }}</fig-button>

                    <div class="p-2">
                        <!-- shipping address form view -->
                        <checkout-address-form
                            v-if="step === 1"
                            :cart="cart"
                            @done="onCheckoutAddressFormDone" />

                        <!-- shipping address details && rate selection view -->
                        <template v-else>
                            <fig-overlay :show="shippingRates.loading">
                                <div class="text-gray-700 text-sm border border-gray-200 p-2 rounded">
                                    <cart-shipping-address-details :cart="cart" />
                                </div>

                                <checkout-shipping-rates />


                                <!-- Shipping estimates -->
                                <div class="mt-4">
                                    <div class="text-gray-900 font-semibold mb-2" v-if="shippingRates.rates.length">
                                        {{ shippingRates.rates.length > 1 ? $t('Choose your shipping speed') : $t('Shipping') }}:
                                    </div>

                                    <div>
                                        <!-- selected rate details -->
                                        <template v-if="step === 3">
                                            <template v-if="shippingRates.selectedRate">
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
                                                v-for="obj in shippingRates.rates"
                                                :key="obj.rate_id"
                                                name="selectedShipping"
                                                :checked-value="obj.rate_id"
                                                v-model="shippingRates.selectedRate">
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
                                                    :disabled="!shippingRates.selectedRate">{{ $t('Continue to payment') }}</fig-button>
                                            </div>
                                        </template>
                                    </div>
                                </div>
                            </fig-overlay>
                        </template>
                    </div>
                </fig-text-card>


                <!-- PAYMENT CARD -->
                <fig-text-card
                    v-if="step === 3"
                    variant="dark"
                    class="mb-4">
                    <div slot="header-left" class="font-semibold p-1 uppercase">2. {{ $t('Payment') }}</div>
                    <div class="p-2">

                        <div class="pb-6">
                            <div class="font-medium text-black">{{ $t('SELECT PAYMENT METHOD') }}</div>
                            <fig-payment-type-chooser v-model="payment.paymentType" />
                        </div>

                        <!-- credit card payment form -->
                        <div v-show="payment.paymentType === 'cc'">
                            <fig-overlay :show="payment.loading">
                                <fig-stripe-form
                                    :stripe="Stripe"
                                    @valid="onStripeFormValid"
                                    @token="onStripeTokenGenerated">

                                    <template v-slot:content="props">
                                        <!-- billing same as shipping checkbox -->
                                        <div class="mt-4">
                                            <fig-form-checkbox
                                                class="mr-3"
                                                v-model="payment.billing_same_as_shipping">{{ $t('Billing address same as shipping') }}</fig-form-checkbox>
                                        </div>

                                        <!-- billing address form -->
                                        <div v-if="!payment.billing_same_as_shipping" class="mt-4">
                                            <div class="text-black">{{ $t('Billing address') }}:</div>
                                            <fig-address-form
                                                v-model="billingForm.form"
                                                @invalid="onBillingAddressFormInvalid"
                                                hide-email
                                                hide-phone />
                                        </div>

                                        <!-- place order button -->
                                        <div class="pt-6">
                                            <fig-button
                                                variant="primary"
                                                size="lg"
                                                @click="onClickPlaceOrder(props.cardElement)"
                                                :disabled="!canShowPlaceOrderButton">{{ $t('PLACE YOUR ORDER') }}</fig-button>
                                        </div>
                                    </template>
                                </fig-stripe-form>
                            </fig-overlay>
                        </div>

                        <!-- paypal payment form -->
                        <div v-if="payment.paymentType === 'paypal'" class="text-center">
                            <paypal-button
                                @success="paypalCompleted"
                                @cancelled="paypalCancelled"
                                @error="paypalError" />
                        </div>
                    </div>
                </fig-text-card>
            </template>


            <template slot="right">
                <fig-text-card variant="light">
                    <div slot="header-left" class="font-semibold p-1 uppercase">{{ $t('Your cart') }}</div>
                    <div slot="header-right" class="text-sm">
                        <nuxt-link to="/cart">{{ $t('Edit') }}</nuxt-link>
                    </div>

                    <div class="text-sm">
                        <cart-totals-table
                            :cart="$store.state.cart"
                            :shipping="step > 1"
                            :sales-tax="step > 1" />

                        <fig-divider />

                        <div class="cart-item-mini-container">
                            <cart-item-mini
                                v-for="(item, index) in cart.cart_items"
                                :key="item.id"
                                :item="item"
                                :image-loading="index > 5 ? 'lazy' : 'eager'" />
                        </div>
                    </div>
                </fig-text-card>
            </template>
        </fig-cart-cta-layout>
    </fig-content>
</template>
