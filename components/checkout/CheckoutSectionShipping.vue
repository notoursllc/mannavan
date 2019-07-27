<script>
import { mapGetters } from 'vuex'
import isObject from 'lodash.isobject'
import forEach from 'lodash.foreach'
import cloneDeep from 'lodash.clonedeep'
import shopping_cart_mixin from '@/mixins/shopping_cart_mixin'
import app_mixin from '@/mixins/app_mixin'

let currentNotification = null;


export default {
    components: {
        ShippingBillingForm: () => import('@/components/checkout/ShippingBillingForm'),
        ShippingView: () => import('@/components/checkout/ShippingView'),
        BottomPopover: () => import('@/components/BottomPopover')
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
                    name: `${c.shipping_firstName} ${c.shipping_lastName}`,
                    company: c.shipping_company,
                    street1: c.shipping_streetAddress,
                    city: c.shipping_city,
                    state: c.shipping_state,
                    zip: c.shipping_postalCode,
                    country: c.shipping_countryCodeAlpha2
                });

                if(!isObject(result)
                    || !result.hasOwnProperty('validation_results')
                    || !result.validation_results.is_valid) {
                    currentNotification = this.$notify({
                        title: this.$t('The address you provided does not seem to be a valid mailing adddress.'),
                        duration: 0,
                        type: 'error'
                    });
                }
                else {
                    // Updating the shipping attributes:
                    let updates = {};
                    updates.shipping_company = result.company;
                    updates.shipping_streetAddress = result.street1;
                    updates.shipping_city = result.city;
                    updates.shipping_state = result.state;
                    updates.shipping_postalCode = result.zip;
                    updates.shipping_countryCodeAlpha2 = result.country;

                    this.$store.dispatch('shoppingcart/CART_SET', updates);

                    await this.shippingFormDone();
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
