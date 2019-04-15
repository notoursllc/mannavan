<script>
import Vue from 'vue'
import { mapGetters } from 'vuex'
import { Button, Loading } from 'element-ui'
import cloneDeep from 'lodash.clonedeep'
import CheckoutSectionShipping from '@/components/checkout/CheckoutSectionShipping'
import CheckoutSectionPostage from '@/components/checkout/CheckoutSectionPostage'
import CheckoutSectionPayment from '@/components/checkout/CheckoutSectionPayment'
import CheckoutSectionBilling from '@/components/checkout/CheckoutSectionBilling'
import CartItemsMini from '@/components/cart/CartItemsMini'
import CartTotalsTable from '@/components/cart/CartTotalsTable'
import SiteName from '@/components/SiteName'
import BottomPopover from '@/components/BottomPopover'
import shopping_cart_mixin from '@/mixins/shopping_cart_mixin'
import app_mixin from '@/mixins/app_mixin'

Vue.use(Button);
Vue.use(Loading.directive);

let currentNotification = null;


export default {
    components: {
        CheckoutSectionShipping,
        CheckoutSectionPostage,
        CheckoutSectionPayment,
        CheckoutSectionBilling,
        CartItemsMini,
        CartTotalsTable,
        SiteName,
        BottomPopover
    },

    mixins: [
        app_mixin,
        shopping_cart_mixin
    ],

    data: function() {
        return {
            loading: false,
            paymentMethod: 'CREDIT_CARD',
            validations: {
                shippingForm: false,
                billingForm: false,
                paymentForm: false,
            }
        }
    },

    computed: {
        ...mapGetters({
            shoppingCart: 'shoppingcart/cart'
        }),

        placeOrderButtonEnabled() {
            return this.validations.shippingForm && this.validations.billingForm && this.validations.paymentForm;
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
            this.loading = true;
            await this.setBillingData();

            if(this.paymentMethod === 'PAYPAL') {
                this.tokenizePaypal();
            }
            else {
                // TODO: tokenize aquare fields
                // this.tokenizeHostedFields();
                this.$nuxt.$emit('CHECKOUT_SUBMIT_PAYMENT_FORM', true);
            }
        }
    },

    created() {
        if(this.cartEmptyRedirect(this.shoppingCart)) {
            return;
        }

        this.$store.dispatch('ui/IN_CHECKOUT_FLOW', true);
        this.$store.dispatch('ui/pageTitle', this.$t('Checkout'));

        this.$nuxt.$on('CHECKOUT_PAYMENT_METHOD', (paymentMethod) => {
            this.paymentMethod = paymentMethod;
        });

        this.$nuxt.$on('CHECKOUT_SHIPPING_FORM_VALID', (isValid) => {
            this.validations.shippingForm = isValid;
        });

        this.$nuxt.$on('CHECKOUT_BILLING_FORM_VALID', (isValid) => {
            this.validations.billingForm = isValid;
        });

        this.$nuxt.$on('CHECKOUT_PAYMENT_FORM_VALID', (isValid) => {
            this.validations.paymentForm = isValid;

            if(!isValid) {
                this.loading = false;
            }
        });

        this.$nuxt.$on('CHECKOUT_PAYMENT_FORM_LOADING', (isLoading) => {
            this.loading = isLoading;
        });
    },

    beforeDestroy() {
        this.$nuxt.$off('CHECKOUT_PAYMENT_METHOD');
        this.$nuxt.$off('CHECKOUT_SHIPPING_FORM_VALID');
        this.$nuxt.$off('CHECKOUT_BILLING_FORM_VALID');
        this.$nuxt.$off('CHECKOUT_PAYMENT_FORM_VALID');
        this.$nuxt.$off('CHECKOUT_PAYMENT_FORM_LOADING');
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
    <div class="checkout-container">

        <div class="order-container" v-loading="loading">
            <div class="order-wrapper">
                <checkout-section-shipping />

                <div v-show="validations.shippingForm">
                    <checkout-section-postage />
                    <checkout-section-payment />
                    <checkout-section-billing v-show="paymentMethod === 'CREDIT_CARD'" />

                    <div class="tac">
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

                    <div class="fs12 mtl tac">
                        <i18n path="accept_privacy_and_tos" tag="div">
                            <span place="siteName"><site-name></site-name>'s</span>
                            <span place="linkPrivacy"><nuxt-link :to="{name: 'privacy'}">{{ $t('Privacy Notice') }}</nuxt-link></span>
                            <span place="linkTos"><nuxt-link :to="{name: 'conditions-of-use'}">{{ $t('Conditions of Use') }}</nuxt-link></span>
                        </i18n>
                    </div>

                </div>
            </div>
        </div>


        <div class="cart-container">
            <cart-items-mini :shopping-cart="shoppingCart" />

            <div class="ptl">
                <cart-totals-table
                    :cart="shoppingCart"
                    :show-shipping-cost="true"
                    :show-sales-tax="true" />
            </div>
        </div>
    </div>
</template>


<style lang="scss">
    @import "@/assets/css/components/_variables.scss";
    @import "@/assets/css/components/_mixins.scss";

    .checkout-container {
        @include flexbox();
        @include flex-direction(row);
        // @include align-items(stretch);
        width: 100%;

        .order-container {
            @include flex-grow(1);
            padding: 30px;

            .g-spec-locked {
                margin-bottom: 30px;
            }
        }

        .order-wrapper {
            margin-left: auto;
            margin-right: auto;
            max-width: 662px;
        }

        .cart-container {
            background: rgb(241, 241, 241);
            width: 35%;
            padding: 30px;
        }
    }

    @media #{$medium-and-down} {
        .checkout-container {
            @include flex-direction(column);

            .order-container,
            .cart-container {
                width: 100%;
                padding: 10px;
            }
        }
    }
</style>
