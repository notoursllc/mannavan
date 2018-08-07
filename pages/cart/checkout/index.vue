<script>
import Vue from 'vue'
import { mapGetters } from 'vuex'
import isObject from 'lodash.isobject'
import forEach from 'lodash.foreach'
import cloneDeep from 'lodash.clonedeep'
import { Notification, Loading, Button } from 'element-ui'
import ShippingBillingForm from '@/components/checkout/ShippingBillingForm'
import ShippingBillingHelp from '@/components/checkout/ShippingBillingHelp'
import BottomPopover from '@/components/BottomPopover'
import IconAddress from '@/components/icons/IconAddress'
import shopping_cart_mixin from '@/mixins/shopping_cart_mixin'
import app_mixin from '@/mixins/app_mixin'


Vue.prototype.$notify = Notification;
Vue.use(Button)
Vue.use(Loading.directive)

let currentNotification = null;

export default {
    components: {
        ShippingBillingForm,
        ShippingBillingHelp,
        BottomPopover,
        IconAddress
    },

    mixins: [
        app_mixin,
        shopping_cart_mixin
    ],

    computed: {
        ...mapGetters({
            shoppingCart: 'shoppingcart/cart',
            shippingAttributes: 'shoppingcart/shippingAttributes'
        }),
    },

    data: function() {
        return {
            shippingButtonEnabled: false,
            loading: false
        }
    },

    methods: {
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

                this.$router.push({ name: 'cart-checkout-placeorder' });
            }
            catch(err) {
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
                                return;

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
                                return;

                            default:
                                await this.shippingFormDone();
                        }
                    }
                }
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
            }
        },

        async continueToPayment() {
            this.loading = true;
            await this.submitShippingForm();
            this.loading = false;
        }

    },

    mounted() {
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
    <div class="pageContainerMax pageContainerMaxSkinny" v-loading="loading" >
        <!-- <div class="fs24 tac mbl">{{ $t('Shipping address') }}</div> -->
        <div class="tac mbl">
            <icon-address
                icon-name="address"
                class-name="fillGreen"
                width="30px" />
            <div class="colorGreen fs20">{{ $t('Shipping address') }}</div>
        </div>

        <div class="mtm">
            <shipping-billing-form type="shipping" @valid="val => { shippingButtonEnabled = val }"></shipping-billing-form>

            <div class="ptl displayTable" style="margin:0 auto">
                <shipping-billing-help></shipping-billing-help>
            </div>
        </div>

        <div class="ptl tac">
            <div class="inlineBlock">
                <el-button type="success"
                            size="large"
                            @click="continueToPayment"
                            :disabled="!shippingButtonEnabled"
                            round>{{ $t('CONTINUE TO PAYMENT') }}</el-button>

                <bottom-popover width="225px"
                                v-show="!shippingButtonEnabled" >{{ $t('fill_out_form_warning') }}</bottom-popover>
            </div>
        </div>
    </div>
</template>
