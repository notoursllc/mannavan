<script>
import { mapGetters } from 'vuex';
import isObject from 'lodash.isobject';
import cloneDeep from 'lodash.clonedeep';
import app_mixin from '@/mixins/app_mixin';
import shopping_cart_mixin from '@/mixins/shopping_cart_mixin';
import CartTotalsTable from '@/components/cart/CartTotalsTable';
import DeliveryOptionsForm from '@/components/checkout/DeliveryOptionsForm';
import { parseIso8601 } from '@/utils/common';

import {
    FigButton,
    FigOverlay,
    // FigModal,
    FigTextCard,
    FigCartCtaLayout,
    FigDivider,
    FigAddress,
    FigFormRadio,
    FigIcon
} from '@notoursllc/figleaf';

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
        CartTotalsTable,
        DeliveryOptionsForm,
        // ShippingBillingForm: () => import('@/components/checkout/ShippingBillingForm'),
        // BottomPopover: () => import('@/components/BottomPopover'),
        // CartItemMini: () => import('@/components/cart/CartItemMini'),
        // CartTotalsTable: () => import('@/components/cart/CartTotalsTable')
    },

    mixins: [
        app_mixin,
        shopping_cart_mixin
    ],

    data: function() {
        return {
            loading: false,
            showDeliveryOptions: true,
            deliveryOptions: {
                showDetails: false,
                loading: false,
                done: false,
                shipping: {
                    loading: false,
                    estimates: [],
                    selectedRate: null,
                    showDetails: false
                }
            },
            payment: {
                show: false
            },
            orderReview: {
                show: false
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
            cart: 'cart/cart',
            shippingRateTotal: 'cart/shippingRateTotal',
            shippingRateEstimatedDeliveryDate: 'cart/shippingRateEstimatedDeliveryDate'
        })

        // ...mapGetters({
        //     shippingAttributes: 'shoppingcart/shippingAttributes'
        // }),

        // shoppingCart() {
        //     return this.$store.state.cart.cart;
        // },

        // shippingFormIsValid: {
        //     get: function() {
        //         return this.$store.state.checkout.validations.shippingForm;
        //     },
        //     set: async function(newVal) {
        //         await this.$store.dispatch('checkout/SHIPPING_FORM_VALID', newVal);
        //     }
        // }
    },

    created() {
        this.$store.dispatch('ui/IN_CHECKOUT_FLOW', true);
    },

    methods: {
        async onDeliveryOptionsSaved() {
            this.deliveryOptions.shipping.loading = true;
            this.deliveryOptions.showDetails = true;

            try {
                const { data } = await this.$api.cart.shipping.estimate(this.$store.state.cart.cart.id);
                console.log("SHIPPING ESTIMATE", data)
                this.deliveryOptions.shipping.estimates = data;

                if(this.deliveryOptions.shipping.estimates.length === 1) {
                    this.deliveryOptions.shipping.selectedRate = this.deliveryOptions.shipping.estimates[0].rate_id;

                }
            }
            catch(err) {
                this.$errorToast({
                    title: this.$t('A server error occurred while setting the shipping rates'),
                    text: err.message
                });

                this.$bugsnag.notify(err);
            }

            this.deliveryOptions.shipping.loading = false;
        },

        translateShippingDate(isoDate) {
            const parsed = parseIso8601(isoDate);

            if(parsed.month && parsed.day) {
                return this.$t(`month_${parsed.month}_short`) + ' ' + parsed.day;
            }
        },

        async continueToPayment() {
            this.deliveryOptions.loading = true;

            try {
                const { data } = await this.$api.cart.shipping.selectRate(
                    this.$store.state.cart.cart.id,
                    this.deliveryOptions.shipping.selectedRate
                );

                this.$store.dispatch('cart/CART', data);
                this.deliveryOptions.done = true;
                this.deliveryOptions.shipping.showDetails = true;
            }
            catch(err) {
                this.$errorToast({
                    title: this.$t('An error occurred')
                });

                this.$bugsnag.notify(err);
            }

            this.deliveryOptions.loading = false;
        }

        /*
        shippingFormDone: async function() {
            try {
                const shippingAttributes = cloneDeep(this.shippingAttributes);
                delete shippingAttributes.shipping_total;
                delete shippingAttributes.shipping_rate;
                delete shippingAttributes.shipping_fullName;

                // This step needs to clear the shipping rate cache because
                // we are assuming the shipping address has changed and thus
                // new rates should be retrieved
                await this.$store.dispatch('shoppingcart/CLEAR_SHIPPING_RATES_CACHE');

                // Setting the shipping address will also calculate the
                // sales tax for the cart because sales tax calculation requires
                // knowledge of the destination.  Sales tax needs to be set so
                // the API can return the shipping/tax/grand total amounts for the 'review'
                // checkout step
                const response = await this.setShippingAddress(shippingAttributes);
                this.setCartAndTokenStateFromResponse(response);

                const cart = response.data.data;

                if(!cart.billing_countryCodeAlpha2) {
                    cart.billing_countryCodeAlpha2 = cart.shipping_countryCodeAlpha2

                    if(!cart.billing_state) {
                        cart.billing_state = cart.shipping_state
                    }
                }

                this.shippingFormIsValid = true;
                this.$router.push({ name: 'cart-checkout-place-order' });
            }
            catch(err) {
                this.shippingFormIsValid = false;

                this.$errorToast({
                    title: this.$t(' server error occurred while setting the shipping address')
                });

                this.$bugsnag.notify(err, {
                    request: {
                        setShippingAddress: shippingAttributes
                    }
                });
            }
        },

        submitShippingForm: async function() {
            try {
                const c = this.shoppingCart;

                this.loading = true;

                const validateAddressConfig = {
                    name: `${c.shipping_firstName} ${c.shipping_lastName}`,
                    company: c.shipping_company,
                    street1: c.shipping_streetAddress,
                    city: c.shipping_city,
                    state: c.shipping_state,
                    zip: c.shipping_postalCode,
                    country: c.shipping_countryCodeAlpha2
                };

                const result = await this.validateAddress(validateAddressConfig);

                if(!isObject(result)
                    || !result.hasOwnProperty('validation_results')
                    || !result.validation_results.is_valid) {
                    this.$errorToast({
                        title: this.$t('The address you provided does not seem to be a valid mailing adddress.')
                    });
                }
                else {
                    // Updating the shipping attributes:
                    const updates = {};
                    updates.shipping_company = result.company;
                    updates.shipping_streetAddress = result.street1;
                    updates.shipping_city = result.city;
                    updates.shipping_state = result.state;
                    updates.shipping_postalCode = result.zip;
                    updates.shipping_countryCodeAlpha2 = result.country;

                    this.$store.dispatch('shoppingcart/CART_SET', updates);

                    await this.shippingFormDone();
                }

                this.loading = false;
            }
            catch(error) {
                let msg = error.message;

                if (error.response) {
                    msg = error.response.data.message;
                }

                this.$errorToast({
                    title: msg || 'An internal server error occurred'
                });

                this.$bugsnag.notify(error, {
                    request: {
                        validateAddress: validateAddressConfig
                    }
                });

                this.loading = false;
            }
        },

        onShippingFormValid(isValid) {
            this.shippingFormIsValid = isValid;
        }
        */
    }
};
</script>

<template>
    <div class="pt-10">

        <div v-if="!numCartItems" class="text-center text-lg">
            {{ $t('Your shopping cart does not contain any items.') }}
        </div>

        <fig-cart-cta-layout
            v-else
            right-first-on-break>
            <template slot="left">

                <!-- delivery options -->
                <div class="mb-4">
                    <fig-text-card
                        variant="dark"
                        :show-body="showDeliveryOptions">
                        <div slot="header-left" class="flex items-center font-semibold p-1 uppercase">
                            <fig-icon
                                v-if="deliveryOptions.done"
                                icon="check-circle"
                                :width="24"
                                :height="24"
                                variant="success"
                                class="mr-2" />
                            1. {{ $t('Delivery options') }}
                        </div>

                        <fig-overlay :show="deliveryOptions.loading">
                            <!-- shipping address details view -->
                            <div v-if="deliveryOptions.showDetails">
                                <!-- <div class="text-gray-900">{{ $t('Shipping Address') }}</div> -->
                                <div class="text-gray-700 text-sm border border-gray-200 p-2 rounded flex items-start">
                                    <div class="flex-grow">
                                        <fig-address
                                            :first-name="cart.shipping_firstName"
                                            :last-name="cart.shipping_lastName"
                                            :street-address="cart.shipping_streetAddress"
                                            :extended-address="cart.shipping_extendedAddress"
                                            :city="cart.shipping_city"
                                            :state="cart.shipping_state"
                                            :zip="cart.shipping_postalCode"
                                            :email="cart.shipping_email"
                                            :phone="cart.shipping_phone" />
                                    </div>
                                    <div>
                                        <fig-button
                                            variant="ghost"
                                            size="sm">{{ $t('Edit') }}</fig-button>
                                    </div>
                                </div>

                                <!-- Shipping estimates -->
                                <div class="mt-4">
                                    <fig-overlay :show="deliveryOptions.shipping.loading">
                                        <div class="text-gray-900 font-semibold">
                                            {{ deliveryOptions.shipping.estimates.length > 1 ? $t('Choose your shipping speed') : $t('Shipping') }}:
                                        </div>

                                        <div class="mt-2">
                                            <template v-if="deliveryOptions.shipping.showDetails">
                                                <div class="inline-block text-black">
                                                    {{ $n(shippingRateTotal ? shippingRateTotal/100 : 0, 'currency') }}
                                                </div>
                                                <div class="inline-block text-gray-500 pl-3">
                                                    {{ $t('Estimated arrival: {date}', { date: translateShippingDate(shippingRateEstimatedDeliveryDate) }) }}
                                                </div>
                                            </template>

                                            <template v-else>
                                                <fig-form-radio
                                                    v-for="obj in deliveryOptions.shipping.estimates"
                                                    :key="obj.rate_id"
                                                    name="selectedShipping"
                                                    :checked-value="obj.rate_id"
                                                    v-model="deliveryOptions.shipping.selectedRate">
                                                    <div class="inline-block text-black">
                                                        {{ $n(obj.shipping_amount.amount, 'currency') }}
                                                    </div>
                                                    <div class="inline-block text-gray-500 pl-3">
                                                        {{ $t('Estimated arrival: {date}', { date: translateShippingDate(obj.estimated_delivery_date) }) }}
                                                    </div>
                                                </fig-form-radio>
                                            </template>
                                        </div>
                                    </fig-overlay>

                                    <div class="mt-3 flex justify-end">
                                        <fig-button
                                            variant="primary"
                                            size="md"
                                            @click="continueToPayment"
                                            :disabled="!deliveryOptions.shipping.selectedRate">{{ $t('Continue to payment') }}</fig-button>
                                    </div>
                                </div>
                            </div>

                            <!-- shipping address form view -->
                            <delivery-options-form
                                v-else
                                @saved="onDeliveryOptionsSaved" />
                        </fig-overlay>
                    </fig-text-card>
                </div>


                <!-- payment -->
                <div class="mb-4">
                    <fig-text-card
                        variant="dark"
                        :show-body="payment.show">
                        <div slot="header-left" class="font-semibold p-1 uppercase">2. {{ $t('Payment') }}</div>

                    </fig-text-card>
                </div>


                <!-- order review -->
                <div class="mb-2">
                    <fig-text-card
                        variant="dark"
                        :show-body="orderReview.show">
                        <div slot="header-left" class="font-semibold p-1 uppercase">3. {{ $t('Order review') }}</div>

                    </fig-text-card>
                </div>
            </template>

            <template slot="right">
                <fig-text-card variant="light">
                    <div slot="header-left" class="font-semibold p-1 uppercase">{{ $t('Your cart') }}</div>
                    <div slot="header-right" class="text-sm">
                        <nuxt-link to="/cart">{{ $t('Edit') }}</nuxt-link>
                    </div>

                    <div class="text-sm">
                        <cart-totals-table
                            shipping
                            sales-tax />

                        <fig-divider />
                    </div>
                </fig-text-card>
            </template>
        </fig-cart-cta-layout>
    </div>
</template>
