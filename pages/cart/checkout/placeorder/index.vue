<script>
import Vue from 'vue'
import { mapGetters } from 'vuex'
import isObject from 'lodash.isobject'
import forEach from 'lodash.foreach'
import cloneDeep from 'lodash.clonedeep'
import { Checkbox, Input, Notification, Loading, Dialog, Select, Breadcrumb, BreadcrumbItem } from 'element-ui'
import ShippingBillingForm from '@/components/checkout/ShippingBillingForm'
import CartItems from '@/components/cart/CartItems'
import CartTotalsTable from '@/components/cart/CartTotalsTable'
import ShippingView from '@/components/checkout/ShippingView'
import ShippingBillingHelp from '@/components/checkout/ShippingBillingHelp'
import BottomPopover from '@/components/BottomPopover'
import CreditCardIcon from '@/components/CreditCardIcon'
import SiteName from '@/components/SiteName'
import StatusWrapper from '@/components/StatusWrapper'
import IconCreditCard from '@/components/icons/IconCreditCard'
import IconPaypal from '@/components/icons/IconPaypal'
import IconPackage from '@/components/icons/IconPackage'
import shopping_cart_mixin from '@/mixins/shopping_cart_mixin'
import app_mixin from '@/mixins/app_mixin'
import payment_mixin from '@/mixins/payment_mixin'

Vue.use(Checkbox)
Vue.use(Input)
Vue.use(Dialog)
Vue.use(Select)
Vue.use(Breadcrumb)
Vue.use(BreadcrumbItem)

Vue.prototype.$notify = Notification;

let currentNotification = null;

export default {
    components: {
        ShippingView,
        ShippingBillingHelp,
        ShippingBillingForm,
        Checkbox,
        CartItems,
        BottomPopover,
        CreditCardIcon,
        CartTotalsTable,
        SiteName,
        StatusWrapper,
        IconCreditCard,
        IconPaypal,
        IconPackage
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

        paymentMethodButtonEnabled: function() {
            if(this.paymentMethod === 'PAYPAL' ||
                (this.paymentMethod === 'CREDIT_CARD' &&
                this.inputStatus['card-number'] === 'success' &&
                this.inputStatus['expiration-year'] === 'success' &&
                this.inputStatus['expiration-month'] === 'success' &&
                this.inputStatus['cvv'] === 'success' &&
                (this.billingSameAsShipping || (!this.billingSameAsShipping && this.separateBillingFormValid)))) {
                return true;
            }

            return false;
        },

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
            //test
            STEP_SHIPPING_ADDRESS: 0,
            STEP_SHIPPING_METHOD: 1,
            STEP_PLACE_ORDER: 2,
            shippingRates: null,
            paymentMethod: 'CREDIT_CARD',
            cardType: null,
            securityCodeModalShow: false,
            securityCodeHint: `3 ${this.$tc('digits_text', 3)}`,
            placeOrderButtonLoading: false,
            separateBillingFormValid: false,
            inputStatus: {
                'card-number': null,
                'expiration-year': null,
                'expiration-month': null,
                'cvv': null
            },
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


        submitPaymentForm: async function() {
            await this.setBillingData();
            this.placeOrderButtonLoading = true;

            if(this.paymentMethod === 'PAYPAL') {
                this.tokenizePaypal();
            }
            else {
                this.tokenizeHostedFields();
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


        tokenizeHostedFields() {
            this.placeOrderButtonLoading = true;

            this.braintree.hostedFieldsInstance
                .tokenize()
                .then((payload) => {
                    this.doCheckout(payload.nonce).finally(() => {
                        this.placeOrderButtonLoading = false;
                    });
                })
                .catch((tokenizeErr) => {
                    currentNotification = this.$notify({
                        type: 'error',
                        title: this.$t('Payment method error') + ':',
                        message: this.getBraintreeErrorMessage(tokenizeErr),
                        duration: 0
                    });

                    this.placeOrderButtonLoading = false;
                });
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


        setHostedFieldsEventHandlers: function(hostedFieldsInstance) {
            function getElementId(field) {
                if(isObject(field) && isObject(field.container)) {
                    return field.container.id;
                }
                return null;
            }

            hostedFieldsInstance.on('validityChange', (event) => {
                let field = event.fields[event.emittedBy];
                let id = getElementId(field);

                if(id) {
                    if (field.isValid === false && !field.isPotentiallyValid) {
                        this.inputStatus[id] = 'failed'
                    }
                    else if (field.isValid === true) {
                        this.inputStatus[id] = 'success'
                    }
                    else {
                        this.inputStatus[id] = null
                    }
                }
            });

            hostedFieldsInstance.on('cardTypeChange', (event) => {
                let isPotentiallyValid = (isObject(event.fields) && isObject(event.fields.number) && !event.fields.number.isPotentiallyValid);

                if(isPotentiallyValid) {
                    this.cardType = null;
                }

                // Change card bg depending on card type
                if (event.cards.length === 1) {
                    // Change the CVV length for AmericanExpress cards
                    if (event.cards[0].code.size === 4) {
                        // hostedFieldsInstance.setPlaceholder('cvv', '••••');
                        this.securityCodeHint = `4 ${this.$tc('digits_text', 4)}`;
                    }

                    if(!isPotentiallyValid) {
                        this.cardType = event.cards[0].type;
                    }
                }
                else {
                    // hostedFieldsInstance.setPlaceholder('cvv', '•••');
                    this.securityCodeHint = `3 ${this.$tc('digits_text', 3)}`;

                    if(!isPotentiallyValid) {
                        this.cardType = null;
                    }
                }
            });
        },

        createHostedFields: function(clientInstance) {
            let hostedFields = require('braintree-web/hosted-fields');
            hostedFields.create({
                client: clientInstance,
                styles: {
                    'input': {
                    'font-size': '18px'
                    },
                    'input.invalid': {
                    'color': 'red'
                    },
                    'input.valid': {
                    'color': 'green'
                    }
                },
                fields: {
                    number: {
                        selector: '#card-number'
                        // placeholder: '•••• •••• •••• ••••'
                    },
                    cvv: {
                        selector: '#cvv'
                        // placeholder: '•••'
                    },
                    expirationMonth: {
                        selector: '#expiration-month',
                        placeholder: this.$t('card_expiration_month_hint')
                    },
                    expirationYear: {
                        selector: '#expiration-year',
                        placeholder: this.$t('card_expiration_year_hint')
                    }
                }
            }, (hostedFieldsErr, hostedFieldsInstance) => {
                if (hostedFieldsErr) {
                    currentNotification = this.$notify({
                        type: 'error',
                        title: this.$t('Payment method error') + ':',
                        message: this.getBraintreeErrorMessage(hostedFieldsErr),
                        duration: 0
                    });
                    return;
                }
                else {
                    this.braintree.hostedFieldsInstance = hostedFieldsInstance;
                    this.setHostedFieldsEventHandlers(hostedFieldsInstance);
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

                    this.createHostedFields(clientInstance);
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
        this.$store.dispatch('ui/pageTitle', this.$t('Checkout'));
    },

    head() {
        return {
            title: this.$t('Checkout'),
            meta: [
                { vmid: 'description', name: 'description', content: `Your Shopping Cart at ${this.getSiteName()}` }
            ]
        }
    }
}
</script>

<template>
    <div class="widthAll">
        <div class="pal">
            <el-breadcrumb separator-class="el-icon-arrow-right">
                <el-breadcrumb-item :to="{ name: 'cart-checkout' }">{{ $t('SHIPPING ADDRESS') }}</el-breadcrumb-item>
                <el-breadcrumb-item>{{ $t('PLACE YOUR ORDER') }}</el-breadcrumb-item>
            </el-breadcrumb>
        </div>

        <div class="pageContainerMax pageContainerMaxSkinny">
            <div>
                <div class="displayTable widthAll">
                    <!-- Payment Method -->
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

                    <!-- Card Number -->
                    <div class="displayTableRow" v-show="paymentMethod === 'CREDIT_CARD'">
                        <label class="checkout_form_label fwb">{{ $t('CARD NUMBER') }}:</label>
                        <div class="checkout_form_value">
                            <status-wrapper
                                :success="inputStatus['card-number'] === 'success'"
                                :failed="inputStatus['card-number'] === 'failed'">
                                <div id="card-number" class="el-input__inner"></div>
                                <span class="card-icon">
                                    <credit-card-icon :card-type="cardType"></credit-card-icon>
                                </span>
                            </status-wrapper>
                        </div>
                    </div>

                    <!-- Expiration -->
                    <div class="displayTableRow" v-show="paymentMethod === 'CREDIT_CARD'">
                        <label class="checkout_form_label fwb">{{ $t('EXPIRES') }}:</label>
                        <div class="checkout_form_value">
                            <status-wrapper
                                class-name="inline"
                                :success="inputStatus['expiration-month'] === 'success' && inputStatus['expiration-year'] === 'success'"
                                :failed="inputStatus['expiration-month'] === 'failed' || inputStatus['expiration-year'] === 'failed'">
                                <div class="displayTable">
                                    <div id="expiration-month" class="el-input__inner hostedField70 displayTableCell"></div>
                                    <div class="displayTableCell colorGrayLighter phs vat" style="font-size:22px">/</div>
                                    <div id="expiration-year" class="el-input__inner hostedField70 displayTableCell"></div>
                                </div>
                            </status-wrapper>
                        </div>
                    </div>

                    <!-- CVV -->
                    <div class="displayTableRow" v-show="paymentMethod === 'CREDIT_CARD'">
                        <label class="checkout_form_label">
                            <span class="fwb">{{ $t('SECURITY CODE') }}</span>:
                            <!-- <span class="colorGrayLighter">({{ securityCodeHint }})</span>: -->
                        </label>
                        <div class="checkout_form_value">
                            <div class="displayTableCell">
                                <status-wrapper
                                    class-name="inline"
                                    :success="inputStatus['cvv'] === 'success'"
                                    :failed="inputStatus['cvv'] === 'failed'">
                                    <div id="cvv" class="el-input__inner hostedField80 displayTableCell"></div>
                                </status-wrapper>
                            </div>
                            <div class="displayTableCell plm vam">
                                <span class="underlineDotted cursorPointer" @click="securityCodeModalShow = true">{{ $t("what's a security code?") }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Billing address -->
                    <div class="displayTableRow" v-show="paymentMethod === 'CREDIT_CARD'">
                        <div class="checkout_form_label fwb">{{ $t('BILLING ADDRESS') }}:</div>
                        <div class="checkout_form_value">
                            <el-checkbox v-model="billingSameAsShipping">{{ $t('SAME AS SHIPPING ADDRESS') }}:</el-checkbox>

                            <div class="pll mts" v-show="billingSameAsShipping">
                                <shipping-view :show-details="true" :show-email="false"></shipping-view>
                            </div>
                            <shipping-billing-form type="billing"
                                                v-if="!billingSameAsShipping"
                                                @valid="val => { separateBillingFormValid = val }"
                                                class="mtl"></shipping-billing-form>
                        </div>
                    </div>
                </div>

                <div class="shippingHelp" v-show="paymentMethod === 'CREDIT_CARD'">
                    <shipping-billing-help></shipping-billing-help>
                </div>
            </div>

            <div class="ptl tac">
                <div class="inlineBlock">
                    <cart-totals-table :cart="shoppingCart"
                                        :show-shipping-cost="true"
                                        :show-sales-tax="true"></cart-totals-table>
                </div>
            </div>

            <div class="ptl tac">
                <div class="inlineBlock">
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
            </div>

            <div class="fs12 mtl tac">
                <i18n path="accept_privacy_and_tos" tag="div">
                    <span place="siteName"><site-name></site-name>'s</span>
                    <span place="linkPrivacy"><nuxt-link :to="{name: 'privacy'}">{{ $t('Privacy Notice') }}</nuxt-link></span>
                    <span place="linkTos"><nuxt-link :to="{name: 'conditions-of-use'}">{{ $t('Conditions of Use') }}</nuxt-link></span>
                </i18n>
            </div>

            <div class="ptl">
                <cart-items
                    :shopping-cart="shoppingCart"
                    :allow-edit="false"></cart-items>
            </div>

            <!-- CVV Modal -->
            <el-dialog :title="$t('Finding your security code')"
                    :modal-append-to-body="false"
                    :visible.sync="securityCodeModalShow">
                <div class="cvvCard">
                    <div class="cvvCardPic">
                        <img src="/images/creditcards/card_back_cvv_4.png">
                    </div>
                    <div class="cvvCardContent">
                        <div class="fwb">{{ $t('American Express') }}</div>
                        <div>{{ $t('cvv_help_4_digit') }}</div>
                    </div>
                </div>

                <div class="cvvCard">
                    <div class="cvvCardPic">
                        <img src="/images/creditcards/card_back_cvv_3.png">
                    </div>
                    <div class="cvvCardContent">
                        <div class="fwb">{{ $t('All other cards') }}</div>
                        <div>{{ $t('cvv_help_3_digit') }}</div>
                    </div>
                </div>
            </el-dialog>

        </div>
    </div>
</template>

<style lang="scss">
    @import "@/assets/css/components/_variables.scss";
    @import "@/assets/css/components/_mixins.scss";

    .shippingHelp {
        padding: 10px;
        margin: 20px auto 0 auto;
        display: table;
        font-size: 14px;
        @include rounded();
        background-color: $bgGrayZebra;
        width: 100%;
        text-align: center;
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
