<script>
import Vue from 'vue'
import { Select, Option, Dialog } from 'element-ui'
import StatusWrapper from '@/components/StatusWrapper'
import IconCreditCard from '@/components/icons/IconCreditCard'
import IconPaypal from '@/components/icons/IconPaypal'
import IconLock from '@/components/icons/IconLock'
import CreditCardIcon from '@/components/CreditCardIcon'
import PaymentForm from '@/components/checkout/PaymentForm'
import FormRow from '@/components/FormRow'

Vue.use(Select)
Vue.use(Option)
Vue.use(Dialog)

export default {
    props: {
        showPaymentForm: {
            type: Boolean,
            default: false
        }
    },

    components: {
        StatusWrapper,
        IconCreditCard,
        IconPaypal,
        IconLock,
        PaymentForm,
        CreditCardIcon,
        FormRow
    },

    data: function() {
        return {
            paymentForm: null,
            paymentFormIsReady: false,
            paymentMethod: 'CREDIT_CARD',
            paymentMethodButtonEnabled: false,
            errors: [],
            showCvvDialog: false,
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

    watch: {
        showPaymentForm: function() {
            if (!this.showPaymentForm) {
                return 1;
            }
            this.paymentForm.build();
        }
    },

    computed: {
        showSquareInputFields() {
            // Can't hide the square payment form DOM placeholders until paymentFormIsReady === true
            return !this.paymentFormIsReady || this.paymentMethod === 'CREDIT_CARD';
        }
    },

    methods: {
        requestCardNonce: function(event) {
            // Don't submit the form until SqPaymentForm returns with a nonce
            event.preventDefault();
            // Request a nonce from the SqPaymentForm object
            // this.paymentForm.requestCardNonce();

            // the nonce will be returned in the 'cardNonceResponseReceived' callback function
            this.paymentForm.requestCardNonce();
        },

        emitFormStatus: function() {
            if(this.paymentMethod === 'PAYPAL' ||
                (this.paymentMethod === 'CREDIT_CARD' &&
                this.inputStatus['sq-card-number'] === 'success' &&
                this.inputStatus['sq-expiration-date'] === 'success' &&
                this.inputStatus['sq-cvv'] === 'success' &&
                this.inputStatus['sq-postal-code'] === 'success')) {

                // this.$emit('success', true);
                this.$nuxt.$emit('CHECKOUT_PAYMENT_FORM_VALID', true);
                return;
            }

            // this.$emit('failed', true);
            this.$nuxt.$emit('CHECKOUT_PAYMENT_FORM_VALID', false);
        },

        handlePaymentFormSuccess: function() {
            console.log("HANDLING FORM SUCCESS")
            // this.$nuxt.$emit('CHECKOUT_PAYMENT_FORM_SUCCESS', this.count);
            this.paymentMethodButtonEnabled = true;
        },

        handlePaymentFormFailed: function() {
            console.log("HANDLING FORM FAILURE")
            this.paymentMethodButtonEnabled = false;
        },

        onPaymentMethodChange(val) {
            this.$nuxt.$emit('CHECKOUT_PAYMENT_METHOD', val);
        }
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
                    fontSize: '18px',
                    lineHeight: '36px'
                }
            ],

            // Initialize Apple Pay placeholder ID
            applePay: {
                elementId: "sq-apple-pay"
            },

            // Initialize Masterpass placeholder ID
            masterpass: {
                elementId: "sq-masterpass"
            },

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
                            console.log('postalCodeChanged', inputEvent);
                            self.inputStatus['sq-postal-code'] = inputStatus;
                            break;
                    }

                    self.emitFormStatus();
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
                        errors.forEach(function(error) {
                            self.errors.push(error.message);
                        });
                        return;
                    }
                    // Assign the nonce value to the hidden form field
                    document.getElementById("card-nonce").value = nonce;
                    console.log("NONCE", nonce)
                    self.nonce = nonce;

                    // POST the nonce form to the payment processing page
                    // document.getElementById("nonce-form").submit();
                },

                /*
                * Triggered when: SqPaymentForm is fully loaded
                */
                paymentFormLoaded: function() {
                    self.paymentFormIsReady = true;
                    console.log("paymentFormLoaded", self.paymentFormIsReady);
                    /* HANDLE AS DESIRED */
                }
            }
        });

        this.paymentForm.build();
    }
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
                <!--
                    You should replace the action attribute of the form with the path of
                    the URL you want to POST the nonce to (for example, "/process-card")
                -->
                <!-- <form id="nonce-form" novalidate action="path/to/payment/processing/page" method="post"> -->
                    <div class="errorbox">
                        <div class="error" v-for="error in errors" :key="error.message">{{error}}</div>
                    </div>

                    <div class="displayTable widthAll">
                        <!-- Payment method -->
                        <form-row :value-class="formValueClass">
                            <span slot="label" class="nowrap lineHeight40">{{ $t('Payment method') }}:</span>
                            <template slot="value">
                                <status-wrapper :success="true">
                                    <el-select
                                        v-model="paymentMethod"
                                        @change="onPaymentMethodChange"
                                        placeholder="Select"
                                        class="widthAll">
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
                            </template>
                        </form-row>

                        <!-- card number -->
                        <form-row :value-class="formValueClass" v-show="showSquareInputFields">
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
                        <form-row :value-class="formValueClass" v-show="showSquareInputFields">
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
                        <form-row :value-class="formValueClass" v-show="showSquareInputFields">
                            <span slot="label" class="nowrap lineHeight40">
                                {{ $t('CVV') }}:
                                <span class="underlineDotted fs12 cursorPointer mls" @click="showCvvDialog = true">
                                    {{ $t("what's this?") }}
                                </span>
                            </span>
                            <template slot="value">
                                <status-wrapper
                                    :className="{'widthAll': true, 'el-input-error': inputStatus['sq-cvv'] === 'failed'}"
                                    :success="inputStatus['sq-cvv'] === 'success'"
                                    :failed="inputStatus['sq-cvv'] === 'failed'">
                                    <div id="sq-cvv"></div>
                                </status-wrapper>
                            </template>
                        </form-row>

                        <!-- postal code -->
                        <form-row :value-class="formValueClass" v-show="showSquareInputFields">
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

                    <input type="hidden" id="card-nonce" name="nonce">

                    <div id="sq-walletbox">
                        <div v-show="!applePay" class="wallet-not-enabled">Apple Pay for Web not enabled</div>
                        <!-- Placeholder for Apple Pay for Web button -->
                        <button v-show="applePay" id="sq-apple-pay" class="button-apple-pay"></button>

                        <div v-show="!masterpass" class="wallet-not-enabled">Masterpass not enabled</div>
                        <!-- Placeholder for Masterpass button -->
                        <button v-show="masterpass" id="sq-masterpass" class="button-masterpass"></button>
                    </div>
                <!-- </form> -->
            </div>

            <button @click="requestCardNonce($event)" class="productPurchase payButton">Pay</button>

            <!-- CVV Modal -->
            <el-dialog :title="$t('Finding your security code')"
                    :modal-append-to-body="false"
                    :visible.sync="showCvvDialog">
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
    @import "@/assets/css/components/_mixins.scss";

    .card-icon {
        position: absolute;
        top: 1px;
        right: 0px;

        img {
            width: 65px;
        }
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


.errorbox {
  line-height: 14px;
  text-align: left;
}
.error {
  font-size: 10px;
  color: rgb(164, 0, 30);
  width: 45%;
  display: inline-block;
  margin-top: -10px;
  font-weight: 400;
}
/* Customize the "Pay with Credit Card" button */
.button-credit-card {
  min-width: 200px;
  min-height: 20px;
  padding: 0;
  margin: 5px;
  line-height: 20px;
  box-shadow: 2px 2px 1px rgb(200, 200, 200);
  background: rgb(255, 255, 255);
  border-radius: 5px;
  border: 1px solid rgb(200, 200, 200);
  font-weight: bold;
  cursor: pointer;
}
.modal .payButton {
  margin-left: 0px;
  position: absolute;
  bottom: 0px;
  width: 400px;
}
/* Customize the "{{Wallet}} not enabled" message */
.wallet-not-enabled {
  min-width: 200px;
  min-height: 40px;
  max-height: 64px;
  padding: 0;
  margin: 10px;
  line-height: 40px;
  background: #eee;
  border-radius: 5px;
  font-weight: lighter;
  font-style: italic;
  font-family: inherit;
  display: block;
}
/* Customize the Apple Pay on the Web button */
.button-apple-pay {
  min-width: 200px;
  min-height: 40px;
  max-height: 64px;
  padding: 0;
  margin: 10px;
  background-image: -webkit-named-image(apple-pay-logo-white);
  background-color: black;
  background-size: 100% 60%;
  background-repeat: no-repeat;
  background-position: 50% 50%;
  border-radius: 5px;
  cursor: pointer;
  display: none;
}
/* Customize the Masterpass button */
.button-masterpass {
  min-width: 200px;
  min-height: 40px;
  max-height: 40px;
  padding: 0;
  margin: 10px;
  background-image: url(https://static.masterpass.com/dyn/img/btn/global/mp_chk_btn_147x034px.svg);
  background-color: black;
  background-size: 100% 100%;
  background-repeat: no-repeat;
  background-position: 50% 50%;
  border-radius: 5px;
  border-color: rgb(255, 255, 255);
  cursor: pointer;
}
#sq-walletbox {
  text-align: center;
  vertical-align: top;
  font-weight: bold;
}
</style>

