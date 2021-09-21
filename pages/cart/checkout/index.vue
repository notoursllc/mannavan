<script>
import { mapGetters } from 'vuex';
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
    FigDivider,
    FigAddress,
    FigFormRadio,
    FigIcon,
    FigIconLabel,
    FigFormCheckbox,
    FigAddressForm,
    FigStripeForm,
    FigPaymentTypeChooser,
    FigContent
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
        CartTotalsTable,
        CartItemMini
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
            cart: {},
            shippingForm: {
                loading: false,
                isInvalid: true,
                validation: {
                    error: false,
                    warning: false
                },
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
        this.Stripe = Stripe(this.$config.stripePublishableKey);
        await this.getCart();
        this.setShippingFormFromCart();
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

        setShippingFormFromCart() {
            for(const key in this.shippingForm.form) {
                this.shippingForm.form[key] = this.cart[`shipping_${key}`];
            }
        },

        shippingDataNeedsValidation() {
            let needValidation = false;

            ['streetAddress', 'city', 'state', 'postalCode', 'countryCodeAlpha2'].forEach((attr) => {
                const formAttr = (this.shippingForm.form[attr] + '').toLowerCase().trim();
                const cartAttr = (this.cart[`shipping_${attr}`] + '').toLowerCase().trim();

                if(formAttr !== cartAttr) {
                    needValidation = true;
                }
            });

            return needValidation;
        },

        async saveShippingForm() {
            this.shippingForm.loading = true;

            try {
                const stateData = {};

                for(const key in this.shippingForm.form) {
                    stateData[`shipping_${key}`] = this.shippingForm.form[key];
                }

                const { data } = await this.$api.cart.setShippingAddress({
                    id: this.$store.state.cart.id,
                    ...stateData,
                    validate: this.shippingDataNeedsValidation()
                });

                // https://www.shipengine.com/docs/addresses/validation/#address-status-meanings
                switch(data.validation_status) {
                    case 'error':
                        this.shippingForm.validation.error = true;
                        this.shippingForm.validation.warning = false;
                        break;

                    case 'warning':
                        this.shippingForm.validation.error = false;
                        this.shippingForm.validation.warning = true;
                        break;

                    default:
                        this.shippingForm.validation.error = false;
                        this.shippingForm.validation.warning = false;
                }

                if(!this.shippingForm.validation.error) {
                    this.cart = data.cart;
                    await this.$store.dispatch('cart/CART', this.cart);

                    this.setShippingFormFromCart();
                    this.goToStep(2);
                    this.getShippingRates();
                }
            }
            catch(err) {
                console.log('ERR', err);

                this.$figleaf.errorToast({
                    title: this.$t('Error')
                    // text: err.response.data.message
                });

                this.$bugsnag.notify(err);
            }

            this.shippingForm.loading = false;
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

        async getShippingRates() {
            this.shippingRates.loading = true;

            try {
                const { data } = await this.$api.cart.shipping.getEstimatesForCart(this.$store.state.cart.id);
                this.shippingRates.rates = data;

                // Hopefully an unlikely scenario, but if no shipping rates were returned
                // then we should probably consider it as 'free' and move on to the next step.
                if(!this.shippingRates.rates.length) {
                    this.continueToPayment();
                }
                else if(this.shippingRates.rates.length === 1) {
                    this.shippingRates.selectedRate = this.shippingRates.rates[0].rate_id;
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
            const billingAddressSource = this.payment.billing_same_as_shipping ? this.shippingForm.form : this.billingForm.form;

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

                this.cart = await this.$api.cart.get({
                    id: this.$store.state.cart.id,
                    relations: true
                });

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
                        <template v-if="step === 1">
                            <fig-overlay :show="shippingForm.loading">
                                <!-- validation error -->
                                <div v-if="shippingForm.validation.error" class="p-1 mb-2 bg-red-100 text-red-800 rounded text-sm">
                                    <fig-icon-label>
                                        <fig-icon
                                            slot="left"
                                            icon="alert-circle"
                                            :width="24"
                                            :height="24"
                                            variant="danger" />
                                        {{ $t('shipping_address_validation_error_message') }}
                                    </fig-icon-label>
                                </div>

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
                                <div class="text-gray-700 text-sm border border-gray-200 p-2 rounded">
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

                                    <!-- validation warning -->
                                    <div v-if="shippingForm.validation.warning" class="p-1 mt-1 bg-yellow-100 rounded">
                                        <fig-icon-label>
                                            <fig-icon
                                                slot="left"
                                                icon="urgent"
                                                :width="24"
                                                :height="24"
                                                variant="warning" />
                                            {{ $t('Please double-check this address for accuracy') }}
                                        </fig-icon-label>
                                    </div>
                                </div>

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
                                                    {{ $t('Estimated arrival: {date}', { date: translateShippingDate(shippingRateEstimatedDeliveryDate) }) }}
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
                            shipping
                            sales-tax />

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
