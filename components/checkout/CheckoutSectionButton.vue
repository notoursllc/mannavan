<script>
import Vue from 'vue'
import { mapGetters } from 'vuex'
import { Button } from 'element-ui'
import cloneDeep from 'lodash.clonedeep'
import SiteName from '@/components/SiteName'
import BottomPopover from '@/components/BottomPopover'
import PrivacyDisplay from '@/components/PrivacyDisplay'
import ConditionsOfUseDisplay from '@/components/ConditionsOfUseDisplay'

Vue.use(Button);

let currentNotification = null;


export default {
    components: {
        SiteName,
        BottomPopover,
        PrivacyDisplay,
        ConditionsOfUseDisplay
    },

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


