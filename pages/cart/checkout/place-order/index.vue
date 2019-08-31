<script>
import { mapGetters } from 'vuex'
import shopping_cart_mixin from '@/mixins/shopping_cart_mixin'

export default {
    components: {
        ShippingView: () => import('@/components/checkout/ShippingView'),
        CheckoutSectionPostage: () => import('@/components/checkout/CheckoutSectionPostage'),
        CheckoutSectionPayment: () => import('@/components/checkout/CheckoutSectionPayment'),
        CheckoutSectionBilling: () => import('@/components/checkout/CheckoutSectionBilling'),
        CheckoutSectionButton: () => import('@/components/checkout/CheckoutSectionButton'),
        CartItemMini: () => import('@/components/cart/CartItemMini'),
        CartTotalsTable: () => import('@/components/cart/CartTotalsTable')
    },

    mixins: [
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

        if(!this.shippingFormIsValid) {
            this.$router.push({ name: 'cart-checkout' });
            return true;
        }

        this.$store.dispatch('ui/IN_CHECKOUT_FLOW', true);
    },

    methods: {
        onShippingChangeClick() {
            this.$router.push({ name: 'cart-checkout' });
        }
    },

    head() {
        return {
            title: this.$t('Checkout'),
            meta: [
                { vmid: 'description', name: 'description', content: `Your Shopping Cart at ${this.$store.state.ui.siteName}` }
            ]
        }
    }
}
</script>

<template>
    <div class="checkout-container">
        <div class="order-container" v-loading="isLoading">
            <div class="order-wrapper">
                <div v-if="shippingFormIsValid">

                    <!-- shipping details -->
                    <div class="g-spec-locked">
                        <div class="g-spec-label">
                            <span class="colorGreen fs20">{{ $t('Shipping') }}</span>
                            <a class="fs14 mlm" @click="onShippingChangeClick">({{ $t('Change') }})</a>
                        </div>
                        <div class="g-spec-content">
                            <div class="fs14">
                                <shipping-view />
                            </div>
                        </div>
                    </div>

                    <checkout-section-postage />
                    <checkout-section-payment />
                    <checkout-section-billing v-show="paymentMethod === 'CREDIT_CARD'" />
                    <checkout-section-button />
                </div>
            </div>
        </div>

        <div class="cart-container">
            <cart-item-mini
                v-for="item in shoppingCart.cart_items"
                :key="item.id"
                :cart-item="item" />

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
@import "@/assets/css/components/_checkout.scss";
</style>
