<script>
import Vue from 'vue'
import { mapGetters } from 'vuex'
import isObject from 'lodash.isobject'
import forEach from 'lodash.foreach'
import cloneDeep from 'lodash.clonedeep'
import { Checkbox, Input, Notification, Loading, Select, Radio } from 'element-ui'

import ShippingView from '@/components/checkout/ShippingView'
import ShippingBillingForm from '@/components/checkout/ShippingBillingForm'
import ShippingBillingHelp from '@/components/checkout/ShippingBillingHelp'
import BottomPopover from '@/components/BottomPopover'
import CreditCardIcon from '@/components/CreditCardIcon'
import SiteName from '@/components/SiteName'
import StatusWrapper from '@/components/StatusWrapper'
import IconCreditCard from '@/components/icons/IconCreditCard'
import IconPaypal from '@/components/icons/IconPaypal'
import IconPackage from '@/components/icons/IconPackage'
import IconAddress from '@/components/icons/IconAddress'
import IconLock from '@/components/icons/IconLock'
import IconVan from '@/components/icons/IconVan'
import shopping_cart_mixin from '@/mixins/shopping_cart_mixin'
import app_mixin from '@/mixins/app_mixin'
import payment_mixin from '@/mixins/payment_mixin'

Vue.use(Checkbox)
Vue.use(Input)
Vue.use(Select)
Vue.use(Radio)

Vue.prototype.$notify = Notification;

let currentNotification = null;

export default {
    components: {
        ShippingView,
        ShippingBillingHelp,
        ShippingBillingForm,
        Checkbox,

        BottomPopover,
        CreditCardIcon,

        SiteName,
        StatusWrapper,
        IconCreditCard,
        IconPaypal,
        IconPackage,
        IconAddress,
        IconLock,
        IconVan
    },

    mixins: [
        shopping_cart_mixin,
        app_mixin,
        payment_mixin
    ],

    computed: {
        ...mapGetters({
            shoppingCart: 'shoppingcart/cart',
            billingAttributes: 'shoppingcart/billingAttributes',
            braintreeClientToken: 'shoppingcart/braintreeClientToken'
        }),

        checkoutButtonEnabled: function() {
            return true;
            // return (this.paymentMethod === 'CREDIT_CARD' && !this.$v.$invalid);
        },

        billingSameAsShipping: {
            get: function() {
                return this.shoppingCart.billingSameAsShipping;
            },
            set: function(newVal) {
                this.$store.dispatch('shoppingcart/ATTRIBUTE_SET', {
                    attribute: 'billingSameAsShipping',
                    value: newVal
                });
            }
        }
    },

    data: function() {
        return {
            STEP_SHIPPING_ADDRESS: 0,
            STEP_SHIPPING_METHOD: 1,
            STEP_PLACE_ORDER: 2,
            shippingRates: null,
            paymentMethod: 'CREDIT_CARD',
            placeOrderButtonLoading: false,
            separateBillingFormValid: false,
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
            },
            paymentMethodButtonEnabled: false
        }
    },

    methods: {
        setBillingData: async function() {
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


        handlePaymentFormSuccess: function() {
            console.log("HANDLING FORM SUCCESS")
            this.paymentMethodButtonEnabled = true;
        },


        handlePaymentFormFailed: function() {
            console.log("HANDLING FORM FAILURE")
            this.paymentMethodButtonEnabled = false;
        },


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

    async created() {
        if(this.cartEmptyRedirect(this.shoppingCart)) {
            return;
        }

        if(this.invalidShippingFormRedirect()) {
            return;
        }

        await this.hostedFieldsInit();
        this.$store.dispatch('ui/IN_CHECKOUT_FLOW', true);
        this.$store.dispatch('ui/pageTitle', this.$t('Secure Checkout'));
    },

    head() {
        return {
            title: this.$t('Secure Checkout'),
            meta: [
                { vmid: 'description', name: 'description', content: `Your Shopping Cart at ${this.getSiteName()}` }
            ]
        }
    }
}
</script>

<template>
    <div class="checkout-container">
        <!-- <div class="pal">
            <el-breadcrumb separator-class="el-icon-arrow-right">
                <el-breadcrumb-item :to="{ name: 'cart-checkout' }">{{ $t('SHIPPING ADDRESS') }}</el-breadcrumb-item>
                <el-breadcrumb-item>{{ $t('PLACE YOUR ORDER') }}</el-breadcrumb-item>
            </el-breadcrumb>
        </div> -->


            <div class="order-container">

                <div class="order-wrapper">

                    <!-- Delivery -->
                    <div class="g-spec-locked">
                        <div class="g-spec-label nowrap">
                            <span class="colorGreen fs20 mls">{{ $t('Home Delivery') }}</span>
                        </div>
                        <div class="g-spec-content">
                            <shipping-billing-form type="shipping" @valid="val => { shippingButtonEnabled = val }"></shipping-billing-form>

                            <div class="ptl displayTable fs14" style="margin:0 auto">
                                <shipping-billing-help></shipping-billing-help>
                            </div>
                        </div>
                    </div>





                    <!-- Secure Payment -->
                    <div class="g-spec-locked">
                        <div class="g-spec-label nowrap">
                            <span class="colorGreen fs20 mls">{{ $t('Secure Payment') }}</span>
                            <icon-lock
                                icon-name="lock"
                                class-name="fillGreen"
                                class="mls"
                                width="18px" />
                        </div>
                        <div class="g-spec-content">
                            <div class="displayTableRow">
                                <label class="checkout_form_label fwb">{{ $t('PAYMENT METHOD') }}:</label>
                                <div class="checkout_form_value">
                                    <div class="inlineBlock relative widthAll">
                                        <status-wrapper :success="true">
                                            <el-select v-model="paymentMethod" placeholder="Select" class="widthAll">
                                                <el-option :label="$t('CREDIT CARD')" value="CREDIT_CARD">
                                                    <span class="floatLeft">{{ $t('CREDIT CARD') }}</span>
                                                    <icon-credit-card
                                                        icon-name="credit_card"
                                                        width="20px"
                                                        class="floatRight mts" />
                                                </el-option>
                                                <el-option :label="$t('PAYPAL')" value="PAYPAL">
                                                    <span class="floatLeft">{{ $t('PAYPAL') }}</span>
                                                    <icon-paypal
                                                        icon-name="credit_card"
                                                        width="20px"
                                                        class="floatRight mts" />
                                                </el-option>
                                            </el-select>
                                        </status-wrapper>
                                    </div>
                                </div>
                            </div>

                            <!-- <payment-form
                                @success="handlePaymentFormSuccess"
                                @failed="handlePaymentFormFailed" /> -->
                        </div>
                    </div>


                    <!-- Billing Address -->
                    <div class="g-spec-locked" v-show="paymentMethod === 'CREDIT_CARD'">
                        <div class="g-spec-label nowrap">
                            <span class="colorGreen fs20 mls">{{ $t('Billing address') }}</span>
                        </div>
                        <div class="g-spec-content">
                            <el-checkbox v-model="billingSameAsShipping">{{ $t('SAME AS SHIPPING ADDRESS') }}</el-checkbox>

                            <!-- <div class="pll mts" v-show="billingSameAsShipping">
                                <shipping-view :show-details="true" :show-email="false"></shipping-view>
                            </div> -->
                            <shipping-billing-form type="billing"
                                                v-if="!billingSameAsShipping"
                                                @valid="val => { separateBillingFormValid = val }"
                                                class="mtl"></shipping-billing-form>
                        </div>
                    </div>

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
            </div>










    </div>
</template>

<style lang="scss">
    @import "@/assets/css/components/_variables.scss";
    @import "@/assets/css/components/_mixins.scss";

    .checkout-container {
        @include flexbox();
        @include flex-direction(row);
        // @include align-items(stretch);
        width: 100%;

        .order-container {
            @include flex-grow(1);
            padding: 30px;

            .g-spec-locked {
                margin-bottom: 50px;
            }

            section {
                display: block;
                margin-bottom: 50px;

                .section-header {
                    background: rgb(241, 241, 241);
                    padding: 15px 20px;
                    margin-bottom: 15px;
                    font-weight: bold;
                }
            }
        }

        .order-wrapper {
            margin-left: auto;
            margin-right: auto;
            width: 662px;
        }

        .cart-container {
            background: rgb(241, 241, 241);
            width: 35%;
            padding: 30px;
        }
    }

    .shippingHelp {
        padding: 10px;
        margin-top: 20px;
        // display: table;
        font-size: 14px;
        // @include rounded();
        // background-color: $bgGrayZebra;
        width: 100%;
        // text-align: center;
    }

    .cvvHelpCell {
        display: inline-block;
        text-align: left;
    }

    .card-icon {
        position: absolute;
        top: 1px;
        right: 0px;

        img {
            width: 65px;
        }
    }

    .hostedField70 {
        min-width:70px !important;
        width:70px !important;
    }

    .hostedField80 {
        min-width:80px !important;
        width:80px !important;
    }

    .step-title {
        font-size: 20px;
        font-weight: 500;
        margin-bottom: 20px;
        text-align: center;
    }

    .cvvCard {
        width: 100%;
        margin-bottom: 30px;
    }
    .cvvCardPic {
        display: block;
        width: auto;
    }
    .cvvCardContent {
        display: block;
        padding: 3px 0 0;
        font-size: 12px;
    }

    @media #{$medium-and-up} {
        .cvvCardPic {
            display: table-cell;
            width: 150px;
        }
        .cvvCardContent {
            display: table-cell;
            vertical-align: top;
            padding-left: 20px;
            font-size: 14px;
        }
    }
</style>
