<script>
import { mapGetters } from 'vuex';
import cloneDeep from 'lodash.clonedeep';
import shopping_cart_mixin from '@/mixins/shopping_cart_mixin';
import payment_mixin from '@/mixins/payment_mixin';
import app_mixin from '@/mixins/app_mixin';
import IconInfo from '@/components/icons/IconInfo';


export default {
    components: {
        ShippingView: () => import('@/components/checkout/ShippingView'),
        CartItemMini: () => import('@/components/cart/CartItemMini'),
        CartTotalsTable: () => import('@/components/cart/CartTotalsTable'),
        ShippingBillingForm: () => import('@/components/checkout/ShippingBillingForm'),
        BottomPopover: () => import('@/components/BottomPopover'),
        PrivacyDisplay: () => import('@/components/PrivacyDisplay'),
        ConditionsOfUseDisplay: () => import('@/components/ConditionsOfUseDisplay'),
        StatusWrapper: () => import('@/components/StatusWrapper'),
        IconLock: () => import('@/components/icons/IconLock'),
        CreditCardIcon: () => import('@/components/CreditCardIcon'),
        IconInfo // This one can not be imported asynchronously because it's being used in el-tooltip
    },

    mixins: [
        shopping_cart_mixin,
        payment_mixin,
        app_mixin
    ],

    data: function() {
        return {
            loading: false,
            billingFormValid: false,
            privacyNoticeVisible: false,
            conditionsOfUseVisible: false,

            // secure payment section
            paymentForm: null,
            paymentFormIsReady: false,
            paymentFormIsValid: false,
            paymentMethod: 'CREDIT_CARD',
            masterpass: false,
            applePay: false,
            cardType: null,
            inputStatus: {
                'sq-card-number': null,
                'sq-expiration-date': null,
                'sq-cvv': null,
                'sq-postal-code': null
            },
            nonce: null
        }
    },

    computed: {
        ...mapGetters({
            shoppingCart: 'shoppingcart/cart',
            billingAttributes: 'shoppingcart/billingAttributes',
        }),

        shippingMethod: {
            get: function() {
                return this.$store.state.checkout.shippingMethod;
            },
            set: function(newVal) {
                this.$store.dispatch('checkout/SHIPPING_METHOD', newVal);
            }
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
        },

        shippingFormIsValid() {
            return this.$store.state.checkout.validations.shippingForm;
        },

        placeOrderButtonEnabled() {
            let billingOK = false;
            if(this.billingSameAsShipping) {
                billingOK = true;
            }
            else {
                billingOK = this.billingFormValid
            }

            return this.shippingFormIsValid
                && billingOK
                && this.paymentFormIsValid
        }
    },

    methods: {
        onShippingChangeClick() {
            this.$router.push({ name: 'cart-checkout' });
        },

        onBillingFormValid(val) {
            this.billingFormValid = val;
        },

        async submitPaymentForm() {
            this.loading = true;

            // set billing data:
            if(this.billingSameAsShipping) {
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

            this.paymentForm.requestCardNonce();
            this.loading = false;
        },

        paymentAuthorized(data) {
            // console.log("paymentAuthorized", data);
        },

        paymentCompleted(data) {
            // console.log("paymentCompleted", data);
            this.goToPaymentSuccess(data.transactionId);
        },

        paymentCancelled(data) {
            // console.log("paymentCancelled", data);
        },

        paymentError(data) {
            this.$errorMessage(
                this.$t('An error occurred while processing the PayPal transaction'),
                { closeOthers: true }
            )
        },

        setPaymentFormStatus: function() {
            let valid = true;

            if(this.paymentMethod === 'CREDIT_CARD') {
                Object.keys(this.inputStatus).forEach((key) => {
                    if(this.inputStatus[key] !== 'success') {
                        valid = false;
                    }
                });
            }

            this.paymentFormIsValid = valid;
        },

        async doCheckout(nonce) {
            try {
                const checkoutConfig = {
                    nonce: nonce,
                    ...this.billingAttributes
                };

                const result = await this.checkout(checkoutConfig);

                this.$store.dispatch('shoppingcart/CHECKOUT_CLEANUP');

                // https://docs.connect.squareup.com/api/paymentform#destroy
                try {
                    this.paymentForm.destroy();
                }
                catch(err) {
                    // no nothing
                }

                this.goToPaymentSuccess(result.transactionId);
                return;
            }
            catch(err) {
                this.paymentFormIsValid = false;

                this.$errorMessage(
                    `${this.$t('Error placing order')}: ${this.getApiErrorMessage(err)}`,
                    { closeOthers: true }
                );

                this.$bugsnag.notify(err, {
                    request: {
                        checkout: checkoutConfig
                    }
                });
            }
        },
    },

    mounted() {
        let self = this;

        if(this.cartEmptyRedirect(this.shoppingCart)) {
            return;
        }

        if(!this.shippingFormIsValid) {
            this.$router.push({ name: 'cart-checkout' });
            return true;
        }

        // SqPaymentForm comes from the Square API at https://js.squareup.com/v2/paymentform
        this.paymentForm = new SqPaymentForm({
            autoBuild: false,
            applicationId: process.env.SQUARE_APP_ID,
            locationId: process.env.SQUARE_LOCATION_ID,
            inputClass: "el-input__inner",

            // Initialize the payment form elements
            // Customize the CSS for SqPaymentForm iframe elements
            inputStyles: [
                {
                    fontSize: '14px',
                    lineHeight: '36px'
                }
            ],

            // Initialize Apple Pay placeholder ID
            // applePay: {
            //     elementId: "sq-apple-pay"
            // },

            // Initialize Masterpass placeholder ID
            // masterpass: {
            //     elementId: "sq-masterpass"
            // },

            // Initialize the credit card placeholders
            cardNumber: {
                elementId: "sq-card-number",
                // placeholder: "Card number"
            },

            cvv: {
                elementId: "sq-cvv",
                // placeholder: "CVV"
            },

            expirationDate: {
                elementId: "sq-expiration-date",
                placeholder: "MM / YY"
            },

            postalCode: {
                elementId: "sq-postal-code",
                // placeholder: "Zip Code"
            },

            // SqPaymentForm callback functions
            // https://docs.connect.squareup.com/api/paymentform/?q=sqpaymentform%20callback#_callbackfunctions_detail
            callbacks: {
                inputEventReceived: function(inputEvent) {
                    let inputStatus = null;

                    if(inputEvent.currentState.isEmpty) {
                        inputStatus = null;
                    }
                    else if(inputEvent.currentState.hasErrorClass || (!inputEvent.currentState.isEmpty && !inputEvent.currentState.isCompletelyValid)) {
                        inputStatus = 'failed';
                    }
                    else if(inputEvent.currentState.isCompletelyValid) {
                        inputStatus = 'success';
                    }

                    // console.log("INPUT STATUS",inputEvent.elementId, inputStatus)
                    switch (inputEvent.eventType) {
                        case 'focusClassAdded':
                        case 'focusClassRemoved':
                        case 'errorClassAdded':
                        case 'errorClassRemoved':
                            // console.log('focusClass/errorClass', inputEvent)
                            self.inputStatus[inputEvent.elementId] = inputStatus;
                            break;

                        case 'cardBrandChanged':
                            // console.log('cardBrandChanged', inputEvent.cardBrand);
                            self.cardType = inputEvent.cardBrand;
                            break;

                        case 'postalCodeChanged':
                            self.inputStatus['sq-postal-code'] = inputStatus;
                            break;
                    }

                    self.setPaymentFormStatus();
                },

                /*
                * Triggered when: the page is loaded.
                */
                methodsSupported: function(methods) {
                    // Only show the button if Apple Pay for Web is enabled
                    // Otherwise, display the wallet not enabled message.
                    self.applePay = methods.applePay;
                    self.masterpass = methods.masterpass;
                },

                /*
                * Digital Wallet related functions
                */
                createPaymentRequest: function() {
                    var paymentRequestJson;
                    /* ADD CODE TO SET/CREATE paymentRequestJson */
                    return paymentRequestJson;
                },

                validateShippingContact: function(contact) {
                    var validationErrorObj;
                    /* ADD CODE TO SET validationErrorObj IF ERRORS ARE FOUND */
                    return validationErrorObj;
                },

                /*
                * Triggered when: SqPaymentForm completes a card nonce request
                */
                cardNonceResponseReceived: function(errors, nonce, cardData) {
                    if (errors) {
                        let errorMsg = [];

                        errors.forEach(function(error) {
                            errorMsg.push(error.message);
                        });

                        self.$errorMessage(
                            `${self.$t('Error placing order')}: ${errorMsg.join('\n')}`,
                            { closeOthers: true }
                        )

                        this.paymentFormIsValid = false;
                        return;
                    }

                    self.doCheckout(nonce);
                },

                /*
                * Triggered when: SqPaymentForm is fully loaded
                */
                paymentFormLoaded: function() {
                    // self.paymentFormIsReady = true;
                }
            }
        });

        this.paymentForm.build();

        this.$store.dispatch('ui/IN_CHECKOUT_FLOW', true);
    },

    head() {
        return {
            title: this.$t('Checkout'),
            meta: [
                { vmid: 'description', name: 'description', content: `Your Shopping Cart at ${this.$store.state.ui.siteName}` }
            ]
        }
    }
}
</script>

<template>
    <div class="checkout-container">
        <div class="order-container" v-loading="loading">
            <div class="order-wrapper">
                <div v-if="shippingFormIsValid">

                    <!-- shipping details -->
                    <div class="g-spec-locked">
                        <div class="g-spec-label">
                            <span class="colorGreen fs20">{{ $t('Shipping') }}</span>
                            <a class="fs14 mlm" @click="onShippingChangeClick">({{ $t('Change') }})</a>
                        </div>
                        <div class="g-spec-content">
                            <div class="fs14">
                                <shipping-view />
                            </div>
                        </div>
                    </div>


                    <!-- Postage -->
                    <div class="g-spec-locked">
                        <div class="g-spec-label colorGreen fs20">{{ $t('Postage') }}</div>
                        <div class="g-spec-content">

                            <el-radio-group v-model="shippingMethod">
                                <el-radio
                                    label="1"
                                    border
                                    size="medium">
                                    {{ $t('Standard') }}:
                                    <div class="inlineBlock mls">
                                        {{ $n(shoppingCart.shipping_total, 'currency') }}
                                    </div>
                                </el-radio>
                            </el-radio-group>

                        </div>
                    </div>


                    <!-- Secure Payment -->
                    <div class="g-spec-locked">
                        <div class="g-spec-label nowrap">
                            <span class="colorGreen fs20">{{ $t('Secure Payment') }}</span>
                            <icon-lock
                                icon-name="lock"
                                class-name="fillGreen"
                                class="mls"
                                width="18px" />
                        </div>

                        <div class="g-spec-content">
                            <div>
                                <div class="mbl">
                                    <el-radio-group
                                        v-model="paymentMethod"
                                        @change="setPaymentFormStatus">
                                        <div class="inlineBlock mrl">
                                            <el-radio
                                                label="CREDIT_CARD"
                                                border
                                                size="medium">{{ $t('CREDIT CARD') }}</el-radio>
                                        </div>

                                        <div class="inlineBlock">
                                            <el-radio
                                                label="PAYPAL"
                                                border
                                                size="medium">{{ $t('PAYPAL') }}</el-radio>
                                        </div>
                                    </el-radio-group>
                                </div>

                                <div class="displayTable widthAll" v-show="this.paymentMethod === 'CREDIT_CARD'">
                                    <!-- card number -->
                                    <div class="formRow">
                                        <label class="nowrap lineHeight40">{{ $t('Card number') }}:</label>
                                        <span class="widthAll">
                                            <status-wrapper
                                                :success="inputStatus['sq-card-number'] === 'success'"
                                                :failed="inputStatus['sq-card-number'] === 'failed'"
                                                :className="{'widthAll': true, 'el-input-error': inputStatus['sq-card-number'] === 'failed'}">
                                                <div id="sq-card-number"></div>
                                                <span class="card-icon">
                                                    <credit-card-icon :card-type="cardType"></credit-card-icon>
                                                </span>
                                            </status-wrapper>
                                        </span>
                                    </div>

                                    <!-- expiration date -->
                                    <div class="formRow">
                                        <label class="nowrap lineHeight40">{{ $t('Expiration date') }}:</label>
                                        <span class="widthAll">
                                            <status-wrapper
                                                :success="inputStatus['sq-expiration-date'] === 'success'"
                                                :failed="inputStatus['sq-expiration-date'] === 'failed'"
                                                :className="{'widthAll': true}">
                                                <div id="sq-expiration-date"></div>
                                            </status-wrapper>
                                        </span>
                                    </div>

                                    <!-- cvv -->
                                    <div class="formRow">
                                        <label class="nowrap lineHeight40">{{ $t('CVV') }}:</label>
                                        <span class="widthAll">
                                            <status-wrapper
                                                :className="{'widthAll': true, 'el-input-error': inputStatus['sq-cvv'] === 'failed'}"
                                                :success="inputStatus['sq-cvv'] === 'success'"
                                                :failed="inputStatus['sq-cvv'] === 'failed'">
                                                <div id="sq-cvv"></div>
                                                <el-tooltip
                                                    class="input-icon"
                                                    popper-class="width200 tac"
                                                    effect="dark"
                                                    :content="$t('cvv_info')"
                                                    placement="bottom-end">
                                                    <icon-info
                                                        icon-name="info"
                                                        class-name="fillGray"
                                                        width="18px" />
                                                </el-tooltip>
                                            </status-wrapper>
                                        </span>
                                    </div>

                                    <!-- postal code -->
                                    <div class="formRow">
                                        <label class="nowrap lineHeight40">{{ $t('Postal code') }}:</label>
                                        <span class="widthAll">
                                            <status-wrapper
                                                :className="{'widthAll': true, 'el-input-error': inputStatus['sq-postal-code'] === 'failed'}"
                                                :success="inputStatus['sq-postal-code'] === 'success'"
                                                :failed="inputStatus['sq-postal-code'] === 'failed'">
                                                <div id="sq-postal-code"></div>
                                            </status-wrapper>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>


                    <!-- Billing Address -->
                    <div class="g-spec-locked" v-show="paymentMethod === 'CREDIT_CARD'" >
                        <div class="g-spec-label colorGreen fs20">{{ $t('Billing address') }}</div>
                        <div class="g-spec-content">
                            <el-radio-group v-model="billingSameAsShipping">
                                <div class="inlineBlock mrl mbm">
                                    <el-radio
                                        :label="true"
                                        border
                                        size="medium">{{ $t('Same as shipping address') }}</el-radio>
                                </div>

                                <div class="inlineBlock">
                                    <el-radio
                                        :label="false"
                                        border
                                        size="medium">{{ $t('Use a different billing address') }}</el-radio>
                                </div>
                            </el-radio-group>

                            <shipping-billing-form
                                type="billing"
                                v-if="!billingSameAsShipping"
                                @valid="onBillingFormValid"
                                class="mtl"></shipping-billing-form>
                        </div>
                    </div>


                    <!-- Button -->
                    <div>
                        <div class="tac" v-show="paymentMethod !== 'PAYPAL'">
                            <el-button
                                type="primary"
                                class="is-huge"
                                @click="submitPaymentForm"
                                :disabled="!placeOrderButtonEnabled"
                                round>{{ $t('PLACE YOUR ORDER') }}</el-button>

                            <bottom-popover
                                width="200px"
                                v-show="!placeOrderButtonEnabled">{{ $t('fill_out_form_warning') }}</bottom-popover>
                        </div>

                        <div class="paypal-button-container tac" v-show="paymentMethod === 'PAYPAL'">
                            <paypal-button
                                @payment-authorized="paymentAuthorized"
                                @payment-success="paymentCompleted"
                                @payment-cancelled="paymentCancelled"
                                @payment-error="paymentError" />
                        </div>

                        <div class="fs12 mtl tac">
                            <i18n path="accept_privacy_and_tos" tag="div">
                                <a slot="linkPrivacy" @click="privacyNoticeVisible = true">{{ $t('Privacy Notice') }}</a>
                                <a slot="linkTos" @click="conditionsOfUseVisible = true">{{ $t('Conditions of Use') }}</a>
                            </i18n>
                        </div>

                        <!-- privacy dialog -->
                        <el-dialog
                            :title="this.$t('Privacy Notice')"
                            :visible.sync="privacyNoticeVisible"
                            width="90%"
                            top="5vh"
                            append-to-body>
                            <div class="tal wordBreakBreakWord">
                                <privacy-display />
                            </div>
                        </el-dialog>

                        <!-- conditions of use dialog -->
                        <el-dialog
                            :title="this.$t('Conditions of Use')"
                            :visible.sync="conditionsOfUseVisible"
                            width="90%"
                            top="5vh"
                            append-to-body>
                            <div class="tal wordBreakBreakWord">
                                <conditions-of-use-display />
                            </div>
                        </el-dialog>
                    </div>

                </div>
            </div>
        </div>


        <div class="cart-container">
            <cart-item-mini
                v-for="item in shoppingCart.cart_items"
                :key="item.id"
                :cart-item="item" />

            <div class="ptl">
                <cart-totals-table
                    :cart="shoppingCart"
                    :show-shipping-cost="true"
                    :show-sales-tax="true" />
            </div>
        </div>
    </div>
</template>


<style lang="scss" scoped>
@import "@/assets/css/components/_checkout.scss";
@import "@/assets/css/components/_mixins.scss";
@import "~assets/css/components/_formRow.scss";

.paypal-button-container {
    width: 300px;
    margin: 0 auto;
}

.card-icon {
    position: absolute;
    top: 1px;
    right: 0px;

    img {
        width: 65px;
    }
}

.input-icon {
    position: absolute;
    top: 11px;
    right: 15px;
}

.el-input-error .el-input__inner {
    border: 1px solid red !important;
}

.cc-info-container {
    @include flexbox();
    @include flex-direction(row);
    @include flex-wrap(nowrap);
    @include justify-content(space-between);

    .cc-info-item {
        width: 30%;
        position: relative;
    }
}
</style>
