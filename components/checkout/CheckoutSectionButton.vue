<script>
import Vue from 'vue'
import { mapGetters } from 'vuex'
import { Button, Loading, Notification } from 'element-ui'
import cloneDeep from 'lodash.clonedeep'
import isObject from 'lodash.isobject'
import SiteName from '@/components/SiteName'
import BottomPopover from '@/components/BottomPopover'
import PrivacyDisplay from '@/components/PrivacyDisplay'
import ConditionsOfUseDisplay from '@/components/ConditionsOfUseDisplay'
import payment_mixin from '@/mixins/payment_mixin'

Vue.use(Button);

let currentNotification = null;


export default {
    name: 'CheckoutSectionButton',

    components: {
        SiteName,
        BottomPopover,
        PrivacyDisplay,
        ConditionsOfUseDisplay
    },

    mixins: [
        payment_mixin
    ],

    data: function() {
        return {
            privacyNoticeVisible: false,
            conditionsOfUseVisible: false,
            braintree: {
                paypalInstance: null
            },

            //test
            paypal: {
                sandbox: 'Aba80Q0HmPEcELAmJqhxHsBJIMC_Kg_AnLPxeBZRGn-7K3XY_ppWkqaVGHrLQH8TBcENTtxdYm2yQxzK',
                production: '',
            },
            paypalButtonStyle: {
                size: 'responsive',
                height: 55,
                color: 'blue',
                shape: 'pill',
                label: 'pay',
                tagline: 'false'
            },
        }
    },

    computed: {
        ...mapGetters({
            shoppingCart: 'shoppingcart/cart',
            braintreeClientToken: 'shoppingcart/braintreeClientToken'
        }),

        placeOrderButtonEnabled() {
            return this.$store.state.checkout.validations.shippingForm
                && this.$store.state.checkout.validations.billingForm
                && this.$store.state.checkout.validations.paymentForm;
        },

        paymentMethod() {
            return this.$store.state.checkout.paymentMethod;
        },

        shippingAddressForPayPal() {
            return {
                recipient_name: `${this.shoppingCart.shipping_firstName} ${this.shoppingCart.shipping_lastName}`,
                line1: this.shoppingCart.shipping_streetAddress,
                // line2: this.shoppingCart.shipping_extendedAddress,
                line2: 'test line 2',
                city: this.shoppingCart.shipping_city,
                country_code: this.shoppingCart.shipping_countryCodeAlpha2,
                postal_code: this.shoppingCart.shipping_postalCode,
                // phone: '011862212345678',
                state: this.shoppingCart.shipping_state,
            }
        }
    },

    methods: {
        dispatchLoading(isLoading) {
            this.$store.dispatch('checkout/IS_LOADING', isLoading);
        },

        async setBillingData() {
            if(this.shoppingCart.billingSameAsShipping) {
                let shippingKeys = [
                    'firstName',
                    'lastName',
                    'streetAddress',
                    'extendedAddress',
                    'company',
                    'city',
                    'state',
                    'postalCode',
                    'countryCodeAlpha2'
                ];

                let cart = cloneDeep(this.shoppingCart);

                shippingKeys.forEach((item) => {
                    cart[`billing_${item}`] = cart[`shipping_${item}`]
                });

                await this.$store.dispatch('shoppingcart/CART_SET', cart);
            }
            return;
        },

        tokenizePaypal() {
            let loadingInstance = Loading.service({
                lock: true,
                fullscreen: true,
                text: this.$t('PAYPAL_WINDOW_IS_OPEN'),
                background: 'rgba(0, 0, 0, 0.7)'
            });

            this.braintree.paypalInstance
                .tokenize({flow: 'vault'})
                .then((payload) => {
                    loadingInstance.setText(`${this.$t('Processing')}...`);

                    this.doCheckout(payload.nonce).finally(() => {
                        loadingInstance.close();
                    });
                })
                .catch((tokenizeErr) => {
                    loadingInstance.close();

                    // Not all error codes warrant a notification popup
                    if (tokenizeErr.code !== 'PAYPAL_POPUP_CLOSED') {
                        currentNotification = this.$notify({
                            type: 'error',
                            title: this.$t('Payment method error') + ':',
                            message: this.getBraintreeErrorMessage(tokenizeErr) || $t('There was an error tokenizing PayPal!'),
                            duration: 0
                        });
                    }
                });
        },

        createPaypal(clientInstance) {
            let paypal = require('braintree-web/paypal');

            paypal.create(
                { client: clientInstance },
                (createPaypalErr, paypalInstance) => {
                    if (createPaypalErr) {
                        currentNotification = this.$notify({
                            type: 'error',
                            title: this.$t('There was an error setting up the payment input fields!'),
                            message: this.getBraintreeErrorMessage(createPaypalErr),
                            duration: 0
                        });
                        return;
                    }

                    this.braintree.paypalInstance = paypalInstance;
                }
            );
        },





        getBraintreeErrorMessage(clientErr) {
            let errorMessage = clientErr;

            if(isObject(clientErr) && clientErr.hasOwnProperty('code')) {
                // https://github.com/braintree/braintree-web/blob/3beb6d43b1c453e3c97f01129fa07a89234b2003/src/hosted-fields/shared/errors.js
                // Not translating all errors, just the ones that could be caused by the user
                switch(clientErr.code) {
                    case 'HOSTED_FIELDS_FIELDS_EMPTY':
                        errorMessage = this.$t('braintree.HOSTED_FIELDS_FIELDS_EMPTY');
                        break;

                    case 'HOSTED_FIELDS_ATTRIBUTE_VALUE_NOT_ALLOWED':
                        errorMessage = this.$t('braintree.HOSTED_FIELDS_ATTRIBUTE_VALUE_NOT_ALLOWED');
                        break;

                    case 'PAYPAL_POPUP_CLOSED':
                        // console.error('Customer closed PayPal popup.');
                        this.paymentMethod = 'CREDIT_CARD'
                        break;

                    case 'PAYPAL_ACCOUNT_TOKENIZATION_FAILED':
                    case 'PAYPAL_FLOW_FAILED':
                        errorMessage = clientErr.details
                        break;

                    default:
                        if(clientErr.hasOwnProperty('message')) {
                            errorMessage = clientErr.message;
                        }
                        else {
                            errorMessage = clientErr.code;
                        }
                }
            }

            return errorMessage;
        },


        async submitPaymentForm() {
            this.dispatchLoading(true);

            await this.setBillingData();

            if(this.paymentMethod === 'PAYPAL') {
                this.tokenizePaypal();
            }
            else {
                this.$nuxt.$emit('CHECKOUT_SUBMIT_PAYMENT_FORM', true);
            }
        },


        async getClientToken() {
            if(this.braintreeClientToken) {
                return this.braintreeClientToken;
            }

            const token = await this.getBraintreeClientToken();
            this.$store.dispatch('shoppingcart/BRAINTREE_CLIENT_TOKEN', token);
            return token;
        },


        async payPalInit() {
            try {
                const token = await this.getClientToken();
                console.log("TOKEN", token)
                const client = require('braintree-web/client');

                try {
                    const clientInstance = await client.create({ authorization: token });
                    // this.createPaypal(clientInstance);
                }
                catch(clientErr) {
                    console.error("PP CLIENT ERROR", clientErr)
                //     currentNotification = this.$notify({
                //         type: 'error',
                //         title: this.$t('There was an error setting up the payment client!'),
                //         message: this.getBraintreeErrorMessage(clientErr),
                //         duration: 0
                //     });
                }
            }
            catch(err) {
                console.log("ERR", err)
                // currentNotification = this.$notify({
                //     type: 'error',
                //     title: this.$t('Error'),
                //     message: err.response.data.message,
                //     duration: 0
                // });
            }
        },


        ///test
        paymentAuthorized(data) {
          console.log("paymentAuthorized", data);
        },
        paymentCompleted(data) {
          console.log("paymentCompleted", data);
        },
        paymentCancelled(data) {
          console.log("paymentCancelled", data);
        },
        paymentError(data) {
          console.log("paymentError", data);
        }
    },

    async created() {
        // await this.payPalInit();
    },
}
</script>

<template>
    <div class="tac">
        <div>
            <el-button
                v-show="paymentMethod !== 'PAYPAL'"
                type="success"
                class="is-huge"
                @click="submitPaymentForm"
                :disabled="!placeOrderButtonEnabled"
                round>{{ $t('PLACE YOUR ORDER') }}</el-button>

            <div class="paypal-button-container" v-show="paymentMethod === 'PAYPAL'">
                <paypal-button
                    :shopping-cart-id="this.shoppingCart.id"
                    @payment-authorized="paymentAuthorized"
                    @payment-success="paymentCompleted"
                    @payment-cancelled="paymentCancelled"
                    @payment-error="paymentError" />

                <!-- <paypal-checkout
                    amount="10.00"
                    currency="USD"
                    env="sandbox"
                    v-on:payment-authorized="paymentAuthorized"
                    v-on:payment-completed="paymentCompleted"
                    v-on:payment-cancelled="paymentCancelled"
                    :client="paypal"
                    :shipping-address="shippingAddressForPayPal"
                    :button-style="paypalButtonStyle" /> -->
            </div>

            <bottom-popover width="200px"
                            v-show="!placeOrderButtonEnabled" >{{ $t('fill_out_form_warning') }}</bottom-popover>
        </div>

        <div class="fs12 mtl">
            <i18n path="accept_privacy_and_tos" tag="div">
                <span place="siteName"><site-name></site-name>'s</span>
                <a place="linkPrivacy" @click="privacyNoticeVisible = true">{{ $t('Privacy Notice') }}</a>
                <a place="linkTos" @click="conditionsOfUseVisible = true">{{ $t('Conditions of Use') }}</a>
            </i18n>
        </div>

        <!-- privacy dialog -->
        <el-dialog
            :title="this.$t('Privacy Notice')"
            :visible.sync="privacyNoticeVisible"
            width="90%">
            <div class="tal">
                <privacy-display />
            </div>
        </el-dialog>

        <!-- conditions of use dialog -->
        <el-dialog
            :title="this.$t('Conditions of Use')"
            :visible.sync="conditionsOfUseVisible"
            width="90%">
            <div class="tal">
                <conditions-of-use-display />
            </div>
        </el-dialog>
    </div>
</template>

<style scoped>
.paypal-button-container {
    width: 300px;
    margin: 0 auto;
}
</style>


