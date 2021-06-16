<script>
import { mapGetters } from 'vuex';
import isObject from 'lodash.isobject';
import cloneDeep from 'lodash.clonedeep';
import app_mixin from '@/mixins/app_mixin';
import shopping_cart_mixin from '@/mixins/shopping_cart_mixin';
import CartTotalsTable from '@/components/cart/CartTotalsTable';
import CartItemMini from '@/components/cart/CartItemMini';
import { parseIso8601 } from '@/utils/common';
import {
    FigButton,
    FigOverlay,
    FigTextCard,
    FigCartCtaLayout,
    FigCheckoutWrapper,
    FigDivider,
    FigAddress,
    FigFormRadio,
    FigIcon,
    FigFormCheckbox,
    FigAddressForm,
    FigStripeForm
} from '@notoursllc/figleaf';


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
        FigCheckoutWrapper,
        FigDivider,
        FigAddress,
        FigFormRadio,
        FigIcon,
        FigFormCheckbox,
        FigAddressForm,
        FigStripeForm,
        CartTotalsTable,
        CartItemMini
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
            step: 1,
            Stripe: null,
            shippingForm: {
                loading: false,
                isInvalid: true,
                form: {
                    ...addressFormBase,
                    email: null,
                    phone: null
                }
            },
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
                billingSameAsShipping: true,
                stripeFormIsValid: false
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
        }),

        canShowPlaceOrderButton() {
            return (this.payment.billingSameAsShipping || !this.billingForm.isInvalid) && this.payment.stripeFormIsValid;
        }
    },

    mounted() {
        this.$store.dispatch('ui/IN_CHECKOUT_FLOW', true);
        this.setShippingFormFromCart();
        this.Stripe = Stripe(this.$config.stripePublishableKey);
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

        onShippingAddressFormInvalid(isInvalid) {
            this.shippingForm.isInvalid = isInvalid;
        },

        onBillingAddressFormInvalid(isInvalid) {
            this.billingForm.isInvalid = isInvalid;
        },

        async continueToPayment() {
            this.shippingRates.loading = true;

            try {
                const { data } = await this.$api.cart.shipping.selectRate(
                    this.$store.state.cart.id,
                    this.shippingRates.selectedRate
                );

                this.$store.dispatch('cart/CART', data);
                this.goToStep(3);
            }
            catch(err) {
                this.$errorToast({
                    title: this.$t('An error occurred')
                });

                this.$bugsnag.notify(err);
            }

            this.shippingRates.loading = false;
        },

        setShippingFormFromCart() {
            for(const key in this.shippingForm.form) {
                this.shippingForm.form[key] = this.cart[`shipping_${key}`];
            }
        },

        async saveShippingForm() {
            this.shippingForm.loading = true;

            try {
                const stateData = {};
                const formData = this.shippingForm.form;

                for(const key in formData) {
                    stateData[`shipping_${key}`] = formData[key];
                }

                const { data } = await this.$api.cart.update({
                    id: this.$store.state.cart.id,
                    ...stateData
                });

                await this.$store.dispatch('cart/CART', data);
                this.setShippingFormFromCart();
                this.goToStep(2);
                this.getShippingRates();
            }
            catch(err) {
                console.log('ERR', err);

                this.$errorToast({
                    title: this.$t('Error')
                    // text: err.response.data.message
                });

                this.$bugsnag.notify(err);
            }

            this.shippingForm.loading = false;
        },

        async getShippingRates() {
            this.shippingRates.loading = true;

            try {
                const { data } = await this.$api.cart.shipping.getEstimatesForCart(this.$store.state.cart.id);
                this.shippingRates.rates = data;

                if(this.shippingRates.rates.length === 1) {
                    this.shippingRates.selectedRate = this.shippingRates.rates[0].rate_id;

                }
            }
            catch(err) {
                this.$errorToast({
                    title: this.$t('A server error occurred while setting the shipping rates'),
                    text: err.message
                });

                this.$bugsnag.notify(err);
            }

            this.shippingRates.loading = false;
        },

        finalizeBillingAddress() {
            const isSame = this.payment.billingSameAsShipping;

            for(const attr in this.billingForm.form) {
                this.billingForm.form[attr] = isSame ? null : this.shippingForm.form[attr];
            }
        },

        async onClickPlaceOrder(cardElement) {
            console.log("cardElement", cardElement);
            this.payment.loading = true;

            const cartId = this.$store.state.cart.id;

            try {
                const { data } = await this.$api.cart.payment.intent(cartId);

                this.finalizeBillingAddress();

                const stripeResponse = await this.sendStripeCardPayment(
                    data.clientSecret,
                    cardElement
                );

                console.log("STRIPE RESPONSE", stripeResponse)

                if(stripeResponse.error) {
                    this.$errorToast({
                        title: this.$t('An error occurred when processing your card'),
                        text: stripeResponse.error
                    });
                    return;
                }

                const successResponse = await this.$api.cart.payment.success(
                    cartId,
                    stripeResponse.paymentIntent.id
                );

                console.log("successResponse", successResponse);

                await this.$store.dispatch('cart/CART_RESET');

                return this.$router.push({
                    name: 'order-id',
                    params: { id: cartId }
                });
            }
            catch(err) {
                this.$errorToast({
                    title: this.$t('An error occurred'),
                    text: err.message
                });

                this.$bugsnag.notify(err);
            }

            this.payment.loading = false;
        },

        sendStripeCardPayment(clientSecret, cardElement) {
            const billingAddressSource = this.payment.billingSameAsShipping ? this.shippingForm.form : this.billingForm.form;

            return this.Stripe.confirmCardPayment(
                clientSecret,
                {
                    payment_method: {
                        card: cardElement,

                        //https://stripe.com/docs/api/payment_methods/create#create_payment_method-billing_details
                        billing_details: {
                            address: {
                                city: billingAddressSource.city,
                                country: billingAddressSource.countryCodeAlpha2,
                                line1: billingAddressSource.streetAddress,
                                line2: billingAddressSource.extendedAddress,
                                postal_code: billingAddressSource.postalCode,
                                state: billingAddressSource.state
                            },
                            name: `${billingAddressSource.firstName} ${billingAddressSource.lastName}`.trim()
                            // email: null,
                            // phone: null
                        },

                        // https://stripe.com/docs/api/payment_methods/create#create_payment_method-metadata
                        metadata: {
                            cart_id: this.cart.id
                        }
                    }
                    // receipt_email: 'gregbruins@gmail.com'
                }
            );
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
        */
    }
};
</script>

<template>
    <fig-checkout-wrapper class="pt-10">

        <div v-if="!numCartItems" class="text-center text-lg">
            {{ $t('Your shopping cart does not contain any items.') }}
        </div>

        <fig-cart-cta-layout
            v-else
            right-first-on-break>
            <template slot="left">

                <!-- delivery options -->
                <div class="mb-4">
                    <fig-text-card variant="dark">
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


                        <!-- shipping address form view -->
                        <template v-if="step === 1">
                            <fig-overlay :show="shippingForm.loading">
                                <fig-address-form
                                    v-model="shippingForm.form"
                                    @invalid="onShippingAddressFormInvalid" />


                                <div class="mt-4 w-full">
                                    <fig-button
                                        variant="primary"
                                        @click="saveShippingForm"
                                        :disabled="shippingForm.isInvalid">{{ $t('Save & Continue') }}</fig-button>
                                </div>
                            </fig-overlay>
                        </template>


                        <!-- shipping address details && rate selection view -->
                        <template v-else>
                            <fig-overlay :show="shippingRates.loading">
                                <div class="text-gray-700 text-sm border border-gray-200 p-2 rounded flex items-start">
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

                                <!-- Shipping estimates -->
                                <div class="mt-4">
                                    <div class="text-gray-900 font-semibold">
                                        {{ shippingRates.rates.length > 1 ? $t('Choose your shipping speed') : $t('Shipping') }}:
                                    </div>

                                    <div class="mt-2">
                                        <!-- selected rate details -->
                                        <template v-if="step === 3">
                                            <div class="inline-block text-black">
                                                {{ $n(shippingRateTotal ? shippingRateTotal/100 : 0, 'currency') }}
                                            </div>
                                            <div class="inline-block text-gray-500 pl-3">
                                                {{ $t('Estimated arrival: {date}', { date: translateShippingDate(shippingRateEstimatedDeliveryDate) }) }}
                                            </div>
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
                                                    {{ $t('Estimated arrival: {date}', { date: translateShippingDate(obj.estimated_delivery_date) }) }}
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
                    </fig-text-card>
                </div>


                <!-- payment -->
                <div class="mb-4">
                    <!-- <fig-text-card
                        variant="dark"
                        :show-body="step === 3"> -->
                    <fig-text-card v-if="step === 3" variant="dark">
                        <div slot="header-left" class="font-semibold p-1 uppercase">2. {{ $t('Payment') }}</div>

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
                                            v-model="payment.billingSameAsShipping">{{ $t('Billing address same as shipping') }}</fig-form-checkbox>
                                    </div>

                                    <!-- billing address form -->
                                    <div v-if="!payment.billingSameAsShipping" class="mt-4">
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

                        <div class="cart-item-mini-container">
                            <cart-item-mini
                                v-for="(item, index) in $store.state.cart.cart_items"
                                :key="item.id"
                                :index="index"
                                :item="item" />
                        </div>
                    </div>
                </fig-text-card>
            </template>
        </fig-cart-cta-layout>
    </fig-checkout-wrapper>
</template>
