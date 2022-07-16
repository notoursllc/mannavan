<script>
import {
    FigButton,
    FigOverlay,
    FigFormCheckbox,
    FigAddressForm,
    FigStripeForm,
    FigPaymentTypeChooser
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
    props: {
        cart: {
            type: Object,
            required: true
        },

        stripe: {
            required: true
        }
    },

    components: {
        FigButton,
        FigOverlay,
        FigFormCheckbox,
        FigAddressForm,
        FigStripeForm,
        FigPaymentTypeChooser
    },

    data: function() {
        return {
            loading: false,
            billing_same_as_shipping: true,
            stripeFormIsValid: false,
            paymentType: 'cc',
            billingForm: {
                isInvalid: true,
                form: {
                    ...addressFormBase
                }
            }
        };
    },

    computed: {
        canShowPlaceOrderButton() {
            return (this.billing_same_as_shipping || !this.billingForm.isInvalid) && this.stripeFormIsValid;
        }
    },

    methods: {
        onStripeFormValid(isValid) {
            this.stripeFormIsValid = isValid;
        },

        onStripeTokenGenerated(token) {
            // console.log("onStripeTokenGenerated", token)
            //TODO: send token to server
        },

        onBillingAddressFormInvalid(isInvalid) {
            this.billingForm.isInvalid = isInvalid;
        },

        saveBillingForm() {
            try {
                // If billing is the same as shipping then
                // set all billing form values to null
                if(this.billing_same_as_shipping) {
                    this.billingForm.form = {
                        ...addressFormBase
                    };
                }

                // append 'billing_' to all of the keys
                const billingData = {
                    billing_same_as_shipping: this.billing_same_as_shipping
                };
                for(const key in this.billingForm.form) {
                    billingData[`billing_${key}`] = this.billingForm.form[key];
                }

                return this.$api.cart.update({
                    id: this.cart.id,
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

        async onClickPlaceOrder(cardElement) {
            this.loading = true;

            // this may be a second attempt at processing payment
            // if the first attempt resulted in an error, so closing
            // any previous message instances
            this.$figleaf.clearToasts();

            try {
                // first save the billing data
                await this.saveBillingForm();

                const { data } = await this.$api.cart.payment.intent(this.cart.id);

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
                        this.cart.id,
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

            this.loading = false;
        },

        sendStripeCardPayment(clientSecret, cardElement) {
            // const billingAddressSource = this.billing_same_as_shipping ? this.shippingForm.form : this.billingForm.form;

            return this.stripe.confirmCardPayment(
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
            await this.$store.dispatch('cart/CART_RESET');

            return this.$router.push({
                name: 'order-id',
                params: { id: this.cart.id }
            });
        }
    }
};
</script>

<template>
    <div>
        <div class="pb-6">
            <div class="font-medium text-black">{{ $t('SELECT PAYMENT METHOD') }}</div>
            <fig-payment-type-chooser v-model="paymentType" />
        </div>

        <div v-show="paymentType === 'cc'">
            <fig-overlay :show="loading">
                <fig-stripe-form
                    :stripe="stripe"
                    @valid="onStripeFormValid"
                    @token="onStripeTokenGenerated">

                    <template v-slot:content="props">
                        <!-- billing same as shipping checkbox -->
                        <div class="mt-4">
                            <fig-form-checkbox
                                class="mr-3"
                                v-model="billing_same_as_shipping">{{ $t('Billing address same as shipping') }}</fig-form-checkbox>
                        </div>

                        <!-- billing address form -->
                        <div v-if="!billing_same_as_shipping" class="mt-4">
                            <div class="text-black">{{ $t('Billing address') }}:</div>
                            <fig-address-form
                                v-model="billingForm.form"
                                @invalid="onBillingAddressFormInvalid"
                                hide-email
                                hide-phone
                                hide-gift />
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
        <div v-if="paymentType === 'paypal'" class="text-center">
            <paypal-button
                @success="paypalCompleted"
                @cancelled="paypalCancelled"
                @error="paypalError" />
        </div>
    </div>
</template>
