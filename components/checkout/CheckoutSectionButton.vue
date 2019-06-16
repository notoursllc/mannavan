<script>
import Vue from 'vue'
import { mapGetters } from 'vuex'
import { Button, Loading, Notification } from 'element-ui'
import cloneDeep from 'lodash.clonedeep'
import isObject from 'lodash.isobject'
import SiteName from '@/components/SiteName'
import BottomPopover from '@/components/BottomPopover'
import PrivacyDisplay from '@/components/PrivacyDisplay'
import ConditionsOfUseDisplay from '@/components/ConditionsOfUseDisplay'
import payment_mixin from '@/mixins/payment_mixin'
import app_mixin from '@/mixins/app_mixin'

Vue.use(Button);


export default {
    name: 'CheckoutSectionButton',

    components: {
        SiteName,
        BottomPopover,
        PrivacyDisplay,
        ConditionsOfUseDisplay
    },

    mixins: [
        payment_mixin,
        app_mixin
    ],

    data: function() {
        return {
            privacyNoticeVisible: false,
            conditionsOfUseVisible: false
        }
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

        async setBillingData() {
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

        async submitPaymentForm() {
            this.dispatchLoading(true);

            await this.setBillingData();
            this.$nuxt.$emit('CHECKOUT_SUBMIT_PAYMENT_FORM', true);
        },

        paymentAuthorized(data) {
            // console.log("paymentAuthorized", data);
        },

        paymentCompleted(data) {
            // console.log("paymentCompleted", data);
            this.$nuxt.$emit('CHECKOUT_PAYMENT_SUCCESS', data.transactionId);
        },

        paymentCancelled(data) {
            // console.log("paymentCancelled", data);
        },

        paymentError(data) {
            this.singletonNotification(
                this.$notify({
                    type: 'error',
                    title: this.$t('An error occurred while processing the PayPal transaction'),
                    duration: 0
                })
            );
        }
    }
}
</script>

<template>
    <div class="tac">
        <div>
            <el-button
                v-show="paymentMethod !== 'PAYPAL'"
                type="primary"
                class="is-huge"
                @click="submitPaymentForm"
                :disabled="!placeOrderButtonEnabled"
                round>{{ $t('PLACE YOUR ORDER') }}</el-button>

            <div class="paypal-button-container" v-show="paymentMethod === 'PAYPAL'">
                <paypal-button
                    @payment-authorized="paymentAuthorized"
                    @payment-success="paymentCompleted"
                    @payment-cancelled="paymentCancelled"
                    @payment-error="paymentError" />
            </div>

            <bottom-popover width="200px"
                            v-show="!placeOrderButtonEnabled" >{{ $t('fill_out_form_warning') }}</bottom-popover>
        </div>

        <div class="fs12 mtl">
            <i18n path="accept_privacy_and_tos" tag="div">
                <span place="siteName"><site-name></site-name>'s</span>
                <a place="linkPrivacy" @click="privacyNoticeVisible = true">{{ $t('Privacy Notice') }}</a>
                <a place="linkTos" @click="conditionsOfUseVisible = true">{{ $t('Conditions of Use') }}</a>
            </i18n>
        </div>

        <!-- privacy dialog -->
        <el-dialog
            :title="this.$t('Privacy Notice')"
            :visible.sync="privacyNoticeVisible"
            width="90%">
            <div class="tal">
                <privacy-display />
            </div>
        </el-dialog>

        <!-- conditions of use dialog -->
        <el-dialog
            :title="this.$t('Conditions of Use')"
            :visible.sync="conditionsOfUseVisible"
            width="90%">
            <div class="tal">
                <conditions-of-use-display />
            </div>
        </el-dialog>
    </div>
</template>

<style scoped>
.paypal-button-container {
    width: 300px;
    margin: 0 auto;
}
</style>


