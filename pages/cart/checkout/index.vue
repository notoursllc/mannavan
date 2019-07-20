<script>
import { mapGetters } from 'vuex'
import shopping_cart_mixin from '@/mixins/shopping_cart_mixin'
import app_mixin from '@/mixins/app_mixin'

let currentNotification = null;


export default {
    components: {
        CheckoutSectionShipping: () => import('@/components/checkout/CheckoutSectionShipping'),
        CheckoutSectionPostage: () => import('@/components/checkout/CheckoutSectionPostage'),
        CheckoutSectionPayment: () => import('@/components/checkout/CheckoutSectionPayment'),
        CheckoutSectionBilling: () => import('@/components/checkout/CheckoutSectionBilling'),
        CheckoutSectionButton: () => import('@/components/checkout/CheckoutSectionButton'),
        CartItemsMini: () => import('@/components/cart/CartItemsMini'),
        CartTotalsTable: () => import('@/components/cart/CartTotalsTable')
    },

    mixins: [
        app_mixin,
        shopping_cart_mixin
    ],

    computed: {
        ...mapGetters({
            shoppingCart: 'shoppingcart/cart'
        }),

        paymentMethod() {
            return this.$store.state.checkout.paymentMethod;
        },

        shippingFormIsValid() {
            return this.$store.state.checkout.validations.shippingForm;
        },

        isLoading() {
            return this.$store.state.checkout.isLoading;
        }
    },

    created() {
        if(this.cartEmptyRedirect(this.shoppingCart)) {
            return;
        }

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
    <div class="checkout-container">

        <div class="order-container" v-loading="isLoading">
            <div class="order-wrapper">
                <checkout-section-shipping />

                <div v-show="shippingFormIsValid">
                    <checkout-section-postage />
                    <checkout-section-payment />
                    <checkout-section-billing v-show="paymentMethod === 'CREDIT_CARD'" />
                    <checkout-section-button />
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
