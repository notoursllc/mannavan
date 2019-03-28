<script>
import Vue from 'vue'
import { mapGetters } from 'vuex'
import isObject from 'lodash.isobject'
import { Notification, Button, Loading } from 'element-ui'
import BottomPopover from '@/components/BottomPopover'
import SiteName from '@/components/SiteName'

Vue.use(Button);
Vue.prototype.$notify = Notification;

let currentNotification = null;

export default {
    components: {
        BottomPopover,
        SiteName
    },

    computed: {
        ...mapGetters({
            shoppingCart: 'shoppingcart/cart',
            billingAttributes: 'shoppingcart/billingAttributes',
            braintreeClientToken: 'shoppingcart/braintreeClientToken'
        }),

        checkoutButtonEnabled: function() {
            return true;
            // return (this.paymentMethod === 'CREDIT_CARD' && !this.$v.$invalid);
        }
    },

    data: function() {
        return {
            paymentMethod: null,
            paymentMethodButtonEnabled: false,
            placeOrderButtonLoading: false,
            braintree: {
                clientInstance: null,
                tokenizePayload: '',
                hostedFieldsInstance: null,
                paypalInstance: null,
                paymentMethodNonce: null,
                transaction: {
                    nonce: null,
                    payPalPayload: null
                }
            }
        }
    },

    methods: {
        submitPaymentForm: async function() {
            await this.setBillingData();
            this.placeOrderButtonLoading = true;

            if(this.paymentMethod === 'PAYPAL') {
                this.tokenizePaypal();
            }
            else {
                // this.tokenizeHostedFields();
            }
        },


        doCheckout: async function(nonce) {
            try {
                let self = this;

                const result = await this.checkout({
                    nonce: nonce,
                    ...this.billingAttributes
                });

                this.$store.dispatch('shoppingcart/CHECKOUT_CLEANUP');

                // Not going to display any error to the user if braintree fails
                // to tear down.
                this.braintree.hostedFieldsInstance.teardown((teardownErr) => {
                    if (teardownErr) {
                        console.log('There was an error tearing it down!', teardownErr.message);
                        this.getBraintreeErrorMessage(teardownErr);
                    }
                });

                return this.$router.push({
                    name: 'order-id',
                    params: { id: result.transactionId }
                });
            }
            catch(error) {
                currentNotification = this.$notify({
                    type: 'error',
                    title: `${ this.$t('Error placing order') }:`,
                    message: self.getApiErrorMessage(error),
                    duration: 0
                });
            }
        },


        // tokenizeHostedFields() {
        //     this.placeOrderButtonLoading = true;

        //     this.braintree.hostedFieldsInstance
        //         .tokenize()
        //         .then((payload) => {
        //             this.doCheckout(payload.nonce).finally(() => {
        //                 this.placeOrderButtonLoading = false;
        //             });
        //         })
        //         .catch((tokenizeErr) => {
        //             currentNotification = this.$notify({
        //                 type: 'error',
        //                 title: this.$t('Payment method error') + ':',
        //                 message: this.getBraintreeErrorMessage(tokenizeErr),
        //                 duration: 0
        //             });

        //             this.placeOrderButtonLoading = false;
        //         });
        // },


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


        createPaypal: function(clientInstance) {
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

        getClientToken: async function() {
            if(this.braintreeClientToken) {
                return this.braintreeClientToken;
            }

            const token = await this.getBraintreeClientToken();
            this.$store.dispatch('shoppingcart/BRAINTREE_CLIENT_TOKEN', token);
            return token;
        },

        hostedFieldsInit: async function() {
            try {
                const token = await this.getClientToken();
                const client = require('braintree-web/client');

                try {
                    const clientInstance = await client.create({ authorization: token });

                    this.createPaypal(clientInstance);
                }
                catch(clientErr) {
                    currentNotification = this.$notify({
                        type: 'error',
                        title: this.$t('There was an error setting up the payment client!'),
                        message: this.getBraintreeErrorMessage(clientErr),
                        duration: 0
                    });
                }
            }
            catch(err) {
                currentNotification = this.$notify({
                    type: 'error',
                    title: this.$t('Error'),
                    message: err.response.data.message,
                    duration: 0
                });
            }
        },

        getBraintreeErrorMessage: function(clientErr) {
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
        }
    },

    created() {
        this.$nuxt.$on('CHECKOUT_PAYMENT_METHOD', (paymentMethod) => {
            console.log("SECTION BUTTON PAYMENT METHOD CAUGHT", paymentMethod)
            this.paymentMethod = paymentMethod;
        });
    },

    beforeDestroy() {
        this.$nuxt.$off('CHECKOUT_PAYMENT_METHOD');
    },
}
</script>

<template>
    <div>
        <div class="tac">
            <el-button type="success"
                        class="is-huge"
                        @click="submitPaymentForm"
                        :loading="placeOrderButtonLoading"
                        :disabled="!paymentMethodButtonEnabled"
                        round>
                <span v-show="paymentMethod === 'PAYPAL'">{{ $t('Pay with PAYPAL') }}</span>
                <span v-show="paymentMethod !== 'PAYPAL'">{{ $t('PLACE YOUR ORDER') }}</span>
            </el-button>

            <bottom-popover width="200px"
                            v-show="!paymentMethodButtonEnabled" >{{ $t('fill_out_form_warning') }}</bottom-popover>
        </div>

        <div class="fs12 mtl tac">
            <i18n path="accept_privacy_and_tos" tag="div">
                <span place="siteName"><site-name></site-name>'s</span>
                <span place="linkPrivacy"><nuxt-link :to="{name: 'privacy'}">{{ $t('Privacy Notice') }}</nuxt-link></span>
                <span place="linkTos"><nuxt-link :to="{name: 'conditions-of-use'}">{{ $t('Conditions of Use') }}</nuxt-link></span>
            </i18n>
        </div>
    </div>
</template>
