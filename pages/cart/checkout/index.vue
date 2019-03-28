<script>
import Vue from 'vue'
import { mapGetters } from 'vuex'
import CheckoutSectionShipping from '@/components/checkout/CheckoutSectionShipping'
import CheckoutSectionPostage from '@/components/checkout/CheckoutSectionPostage'
import CheckoutSectionPayment from '@/components/checkout/CheckoutSectionPayment'
import CheckoutSectionBilling from '@/components/checkout/CheckoutSectionBilling'
import CheckoutSectionButton from '@/components/checkout/CheckoutSectionButton'
// import CartItems from '@/components/cart/CartItems'
import CartItemsMini from '@/components/cart/CartItemsMini'
import CartTotalsTable from '@/components/cart/CartTotalsTable'
import shopping_cart_mixin from '@/mixins/shopping_cart_mixin'
import app_mixin from '@/mixins/app_mixin'

export default {
    components: {
        CheckoutSectionShipping,
        CheckoutSectionPostage,
        CheckoutSectionPayment,
        CheckoutSectionBilling,
        CheckoutSectionButton,
        // CartItems,
        CartItemsMini,
        CartTotalsTable
    },

    mixins: [
        app_mixin,
        shopping_cart_mixin
    ],

    data: function() {
        return {
            paymentMethod: null,
            shippingFormDone: false,
        }
    },

    computed: {
        ...mapGetters({
            shoppingCart: 'shoppingcart/cart'
        }),
    },

    created() {
        this.$store.dispatch('ui/IN_CHECKOUT_FLOW', true);
        this.$store.dispatch('ui/pageTitle', this.$t('Checkout'));

        if(this.cartEmptyRedirect(this.shoppingCart)) {
            return;
        }

        this.$nuxt.$on('CHECKOUT_PAYMENT_METHOD', (paymentMethod) => {
            this.paymentMethod = paymentMethod;
        });

        this.$nuxt.$on('CHECKOUT_SHIPPING_FORM_SUCCESS', (isSuccess) => {
            this.shippingFormDone = isSuccess;
        });

        this.$nuxt.$on('CHECKOUT_SHIPPING_FORM_FAILED', () => {
            this.shippingFormDone = false;
        });
    },

    beforeDestroy() {
        this.$nuxt.$off('CHECKOUT_PAYMENT_METHOD');
        this.$nuxt.$off('CHECKOUT_SHIPPING_FORM_SUCCESS');
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

        <div class="order-container">
            <div class="order-wrapper">
                <checkout-section-shipping />

                <div v-show="shippingFormDone">
                    <checkout-section-postage />
                    <checkout-section-payment />
                    <checkout-section-billing v-show="paymentMethod === 'CREDIT_CARD'" />
                    <checkout-section-button />
                </div>
            </div>
        </div>


        <div class="cart-container">
            <!-- <cart-items
                :shopping-cart="shoppingCart"
                :allow-edit="false" /> -->
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
