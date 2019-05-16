<script>
import Vue from 'vue'
import { mapGetters } from 'vuex'
import isObject from 'lodash.isobject'
import forEach from 'lodash.foreach'
import cloneDeep from 'lodash.clonedeep'
import { Notification, Loading, Button } from 'element-ui'
import ShippingBillingForm from '@/components/checkout/ShippingBillingForm'
import ShippingView from '@/components/checkout/ShippingView'
import BottomPopover from '@/components/BottomPopover'
import shopping_cart_mixin from '@/mixins/shopping_cart_mixin'
import app_mixin from '@/mixins/app_mixin'


Vue.prototype.$notify = Notification;
Vue.use(Button)
Vue.use(Loading.directive)

let currentNotification = null;

export default {
    components: {
        ShippingBillingForm,
        ShippingView,
        BottomPopover
    },

    mixins: [
        app_mixin,
        shopping_cart_mixin
    ],

    data: function() {
        return {
            loading: false,
            shippingFormIsValid: false
        }
    },

    computed: {
        ...mapGetters({
            shoppingCart: 'shoppingcart/cart',
            shippingAttributes: 'shoppingcart/shippingAttributes'
        }),

        showDetails() {
            return this.$store.state.checkout.validations.shippingForm;
        }
    },

    methods: {
        dispatchFormStatus(isValid) {
            this.$store.dispatch('checkout/SHIPPING_FORM_VALID', isValid);
        },

        updateShippingStateFromValidation: function(obj) {
            // Just updating the shipping attributes:
            let updates = {};
            updates.shipping_company = obj.company_name;
            updates.shipping_streetAddress = obj.address_line1;
            updates.shipping_city = obj.city_locality;
            updates.shipping_state = obj.state_province;
            updates.shipping_postalCode = obj.postal_code;
            updates.shipping_countryCodeAlpha2 = obj.country_code;

            this.$store.dispatch('shoppingcart/CART_SET', updates);
        },

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

                this.dispatchFormStatus(true);
            }
            catch(err) {
                this.dispatchFormStatus(false);

                currentNotification = this.$notify({
                    title: this.$t('An error occurred'),
                    message: 'A server error occurred while setting the shipping address.',
                    duration: 0,
                    type: 'error'
                });
            }
        },

        submitShippingForm: async function() {
            try {
                let self = this;
                let c = this.shoppingCart;

                if(currentNotification) {
                    currentNotification.close();
                }

                this.loading = true;

                const result = await this.validateAddress({
                    company_name: c.shipping_company,
                    address_line1: c.shipping_streetAddress,
                    city_locality: c.shipping_city,
                    state_province: c.shipping_state,
                    postal_code: c.shipping_postalCode,
                    country_code: c.shipping_countryCodeAlpha2
                });

                const validation = Array.isArray(result) ? result[0] : result;
                if(isObject(validation)) {
                    // First, checking for error messages:
                    let errorMessages = [];

                    if(Array.isArray(validation.messages)) {
                        // Skipping message code 'a1003', because it seems kind of useless.  It's message is
                        // "Some fields were modified while verifying the address.".  That will just confuse the user,
                        // so it's probably better to display the default message in this case.
                        let skipCodes = ['a1003'];

                        forEach(validation.messages, (msg) => {
                            if(skipCodes.indexOf(msg.code) < 0) {
                                errorMessages.push(msg.message)
                            }
                        });
                    }

                    if(errorMessages.length) {
                        currentNotification = this.$notify({
                            title: this.$t('Address validation error'),
                            message: errorMessages.join('\n\n'),
                            duration: 0,
                            type: 'error'
                        });
                    }
                    else if(validation.status === 'error') {
                        currentNotification = this.$notify({
                            title: this.$t('The address you provided does not seem to be a valid mailing adddress.'),
                            message: errorMessages.join('\n\n'),
                            duration: 0,
                            type: 'error'
                        });
                    }
                    else {
                        switch(validation.status) {
                            case 'verified':
                                this.updateShippingStateFromValidation(validation.matched_address);
                                await this.shippingFormDone();
                                break;

                            // NOTE: The 'unverified' case could still be a correct address.
                            // This will most likely happen if the country value
                            // is not supported (https://docs.shipengine.com/docs/address-validation).
                            // In this case we should consider 'unverified' as valid so the transaction can continue.
                            //
                            // ALSO NOTE: The 'matched_address' property is null when the status is 'unverified',
                            // so we need to get the values from the 'original_address' property
                            case 'unverified':
                                this.updateShippingStateFromValidation(validation.original_address);
                                await this.shippingFormDone();
                                break;

                            default:
                                await this.shippingFormDone();
                        }
                    }
                }

                this.loading = false;
            }
            catch(error) {
                let msg = error.message;

                if (error.response) {
                    msg = error.response.data.message;
                }

                currentNotification = this.$notify({
                    title: msg || "An internal server error occurred",
                    // message: errorMessage,
                    duration: 0,
                    type: 'error'
                });

                this.loading = false;
            }
        },

        onChangeClick: function() {
            this.dispatchFormStatus(false);
        },

        onShippingFormValid(isValid) {
            this.shippingFormIsValid = isValid;
        }
    }
}
</script>

<template>
    <div class="g-spec-locked">
        <div class="g-spec-label">
            <span class="colorGreen fs20">{{ $t('Shipping') }}</span>

            <a v-show="showDetails"
                class="fs14 mlm"
                @click="onChangeClick">({{ $t('Change') }})</a>
        </div>
        <div class="g-spec-content" v-loading="loading">
            <div v-show="!showDetails">
                <shipping-billing-form
                    type="shipping"
                    @valid="onShippingFormValid" />

                <div class="ptm tac">
                    <el-button
                        type="primary"
                        class="is-huge"
                        @click="submitShippingForm"
                        :disabled="!shippingFormIsValid"
                        round>{{ $t('SAVE') }}</el-button>

                    <bottom-popover
                        width="225px"
                        v-show="!shippingFormIsValid">{{ $t('fill_out_form_warning') }}</bottom-popover>
                </div>
            </div>
            <div v-show="showDetails" class="fs14">
                <shipping-view />
            </div>
        </div>
    </div>
</template>
