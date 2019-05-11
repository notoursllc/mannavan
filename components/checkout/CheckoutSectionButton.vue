<script>
import Vue from 'vue'
import { mapGetters } from 'vuex'
import { Button } from 'element-ui'
import cloneDeep from 'lodash.clonedeep'
import SiteName from '@/components/SiteName'
import BottomPopover from '@/components/BottomPopover'

Vue.use(Button);

let currentNotification = null;


export default {
    components: {
        SiteName,
        BottomPopover
    },

    computed: {
        ...mapGetters({
            shoppingCart: 'shoppingcart/cart'
        }),

        placeOrderButtonEnabled() {
            return this.$store.state.checkout.validations.shippingForm
                && this.$store.state.checkout.validations.billingForm
                && this.$store.state.checkout.validations.paymentForm;
        },

        paymentMethod() {
            return this.$store.state.checkout.paymentMethod;
        }
    },

    methods: {
        dispatchLoading(isLoading) {
            this.$store.dispatch('checkout/IS_LOADING', isLoading);
        },

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
            this.dispatchLoading(true);

            await this.setBillingData();

            if(this.paymentMethod === 'PAYPAL') {
                this.tokenizePaypal(); //TODO
            }
            else {
                this.$nuxt.$emit('CHECKOUT_SUBMIT_PAYMENT_FORM', true);
            }
        }
    }
}
</script>

<template>
    <div class="tac">
        <div>
            <el-button type="success"
                        class="is-huge"
                        @click="submitPaymentForm"
                        :disabled="!placeOrderButtonEnabled"
                        round>
                <span v-show="paymentMethod === 'PAYPAL'">{{ $t('Pay with PAYPAL') }}</span>
                <span v-show="paymentMethod !== 'PAYPAL'">{{ $t('PLACE YOUR ORDER') }}</span>
            </el-button>

            <bottom-popover width="200px"
                            v-show="!placeOrderButtonEnabled" >{{ $t('fill_out_form_warning') }}</bottom-popover>
        </div>

        <div class="fs12 mtl">
            <i18n path="accept_privacy_and_tos" tag="div">
                <span place="siteName"><site-name></site-name>'s</span>
                <span place="linkPrivacy"><nuxt-link :to="{name: 'privacy'}">{{ $t('Privacy Notice') }}</nuxt-link></span>
                <span place="linkTos"><nuxt-link :to="{name: 'conditions-of-use'}">{{ $t('Conditions of Use') }}</nuxt-link></span>
            </i18n>
        </div>
    </div>
</template>


