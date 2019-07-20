<script>
import { mapGetters } from 'vuex';
import shopping_cart_mixin from '@/mixins/shopping_cart_mixin';
import app_mixin from '@/mixins/app_mixin';
import payment_mixin from '@/mixins/payment_mixin';

let currentNotification = null;

export default {
    props: {
        showPaymentForm: {
            type: Boolean,
            default: false
        }
    },

    components: {
        StatusWrapper: () => import('@/components/StatusWrapper'),
        IconLock: () => import('@/components/icons/IconLock'),
        IconInfo: () => import('@/components/icons/IconInfo'),
        CreditCardIcon: () => import('@/components/CreditCardIcon'),
        FormRow: () => import('@/components/FormRow')
    },

    mixins: [
        shopping_cart_mixin,
        app_mixin,
        payment_mixin
    ],

    data: function() {
        return {
            paymentForm: null,
            paymentFormIsReady: false,
            masterpass: false,
            applePay: false,
            cardType: null,
            inputStatus: {
                'sq-card-number': null,
                'sq-expiration-date': null,
                'sq-cvv': null,
                'sq-postal-code': null
            },
            formValueClass: {'widthAll': true},
            nonce: null
        }
    },


    computed: {
        ...mapGetters({
            billingAttributes: 'shoppingcart/billingAttributes',
        }),

        showSquareInputFields() {
            // Can't hide the square payment form DOM placeholders until paymentFormIsReady === true
            return !this.paymentFormIsReady || this.paymentMethod === 'CREDIT_CARD';
        },

        paymentMethod: {
            get: function() {
                return this.$store.state.checkout.paymentMethod;
            },
            set: function(newVal) {
                this.dispatchPaymentMethod(newVal);
            }
        }
    },


    methods: {
        dispatchFormStatus(isValid) {
            this.$store.dispatch('checkout/PAYMENT_FORM_VALID', isValid);
        },

        dispatchPaymentMethod(val) {
            this.$store.dispatch('checkout/PAYMENT_METHOD', val);
        },

        setFormStatus: function() {
            if(this.paymentMethod === 'PAYPAL' ||
                (this.paymentMethod === 'CREDIT_CARD' &&
                this.inputStatus['sq-card-number'] === 'success' &&
                this.inputStatus['sq-expiration-date'] === 'success' &&
                this.inputStatus['sq-cvv'] === 'success' &&
                this.inputStatus['sq-postal-code'] === 'success')) {

                this.dispatchFormStatus(true);
                return;
            }

            this.dispatchFormStatus(false);
        },

        onPaymentMethodChange(val) {
            this.dispatchPaymentMethod(val);
            this.setFormStatus();
        },

        doCheckout: async function(nonce) {
            try {
                let self = this;

                const result = await this.checkout({
                    nonce: nonce,
                    ...this.billingAttributes
                });

                console.log("CHECKOUT RESPONSE", result);

                this.$store.dispatch('shoppingcart/CHECKOUT_CLEANUP');

                // https://docs.connect.squareup.com/api/paymentform#destroy
                try {
                    this.paymentForm.destroy();
                }
                catch(err) {
                    // no nothing
                }

                this.onPaymentSuccess(result.transactionId);
                return;
            }
            catch(error) {
                console.log("CHECKOUT SEC PAYMENT CATCH", error)
                this.closeCurrentNotification();

                currentNotification = this.$notify({
                    type: 'error',
                    title: `${ this.$t('Error placing order') }:`,
                    message: this.getApiErrorMessage(error),
                    duration: 0
                });

                this.dispatchFormStatus(false);
            }
        },

        onPaymentSuccess(transactionId) {
            this.goToPaymentSuccess(transactionId);
        },

        closeCurrentNotification() {
            if(currentNotification) {
                currentNotification.close();
            }
        }
    },


    created() {
        this.$nuxt.$on('CHECKOUT_SUBMIT_PAYMENT_FORM', () => {
           this.paymentForm.requestCardNonce();
        });

        this.$nuxt.$on('CHECKOUT_PAYMENT_SUCCESS', (transactionId) => {
           this.onPaymentSuccess(transactionId);
        });
    },


    beforeDestroy() {
        this.$nuxt.$off('CHECKOUT_SUBMIT_PAYMENT_FORM');
        this.$nuxt.$off('CHECKOUT_PAYMENT_SUCCESS');
    },


    mounted: function() {
        let self = this;

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

                    // console.log("INPUT STAUTs",inputEvent.elementId, inputStatus)

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

                    self.setFormStatus();
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
                        self.closeCurrentNotification();

                        let errorMsg = [];
                        errors.forEach(function(error) {
                            errorMsg.push(error.message);
                        });

                        currentNotification = self.$notify({
                            type: 'error',
                            title: `${ self.$t('Error placing order') }:`,
                            message: errorMsg.join('\n'),
                            duration: 0
                        });

                        self.dispatchFormStatus(false);
                        return;
                    }

                    self.doCheckout(nonce);
                },

                /*
                * Triggered when: SqPaymentForm is fully loaded
                */
                paymentFormLoaded: function() {
                    self.paymentFormIsReady = true;
                }
            }
        });

        this.paymentForm.build();
    },


    watch: {
        showPaymentForm: function() {
            if (!this.showPaymentForm) {
                return 1;
            }
            this.paymentForm.build();
        }
    },
}
</script>

<template>
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
                        @change="onPaymentMethodChange">
                        <div class="inlineBlock mrl">
                            <el-radio
                                label="CREDIT_CARD"
                                border
                                size="medium">
                                {{ $t('CREDIT CARD') }}
                            </el-radio>
                        </div>

                        <div class="inlineBlock">
                            <el-radio
                                label="PAYPAL"
                                border
                                size="medium">
                                {{ $t('PAYPAL') }}
                            </el-radio>
                        </div>
                    </el-radio-group>
                </div>

                <div class="displayTable widthAll" v-show="showSquareInputFields">
                    <!-- card number -->
                    <form-row :value-class="formValueClass">
                        <span slot="label" class="nowrap lineHeight40">{{ $t('Card number') }}:</span>
                        <template slot="value">
                            <status-wrapper
                                :success="inputStatus['sq-card-number'] === 'success'"
                                :failed="inputStatus['sq-card-number'] === 'failed'"
                                :className="{'widthAll': true, 'el-input-error': inputStatus['sq-card-number'] === 'failed'}">
                                <div id="sq-card-number"></div>
                                <span class="card-icon">
                                    <credit-card-icon :card-type="cardType"></credit-card-icon>
                                </span>
                            </status-wrapper>
                        </template>
                    </form-row>

                    <!-- expiration date -->
                    <form-row :value-class="formValueClass">
                        <span slot="label" class="nowrap lineHeight40">{{ $t('Expiration date') }}:</span>
                        <template slot="value">
                            <status-wrapper
                                :success="inputStatus['sq-expiration-date'] === 'success'"
                                :failed="inputStatus['sq-expiration-date'] === 'failed'"
                                :className="{'widthAll': true}">
                                <div id="sq-expiration-date"></div>
                            </status-wrapper>
                        </template>
                    </form-row>

                    <!-- cvv -->
                    <form-row :value-class="formValueClass">
                        <span slot="label" class="nowrap lineHeight40">{{ $t('CVV') }}:</span>
                        <template slot="value">
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
                        </template>
                    </form-row>

                    <!-- postal code -->
                    <form-row :value-class="formValueClass">
                        <span slot="label" class="nowrap lineHeight40">{{ $t('Postal code') }}:</span>
                        <template slot="value">
                            <status-wrapper
                                :className="{'widthAll': true, 'el-input-error': inputStatus['sq-postal-code'] === 'failed'}"
                                :success="inputStatus['sq-postal-code'] === 'success'"
                                :failed="inputStatus['sq-postal-code'] === 'failed'">
                                <div id="sq-postal-code"></div>
                            </status-wrapper>
                        </template>
                    </form-row>
                </div>
            </div>
        </div>
    </div>
</template>


<style lang="scss">
@import "@/assets/css/components/_mixins.scss";

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

