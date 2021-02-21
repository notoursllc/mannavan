<script>
import { mapGetters } from 'vuex'

export default {
    components: {
        PageTitle: () => import('@/components/PageTitle'),
        CartItems: () => import('@/components/cart/CartItems'),
        CartTotalsTable: () => import('@/components/cart/CartTotalsTable'),
        GoToCheckoutButtons: () => import('@/components/cart/GoToCheckoutButtons')
    },

    computed: {
        ...mapGetters({
            shoppingCart: 'shoppingcart/cart'
        })
    },

    head() {
        return {
            title: this.$t('Shopping Cart'),
            meta: [
                { vmid: 'description', name: 'description', content: `Your Shopping Cart at ${this.$store.state.ui.siteName}` }
            ]
        }
    }
}
</script>


<template>
    <div>
        <page-title>{{ $t('Shopping Cart') }}</page-title>

        <div class="pageContainerMax">
            <div class="checkout-buttons" v-if="shoppingCart.cart_items && shoppingCart.cart_items.length > 2">
                <go-to-checkout-buttons />
            </div>

            <cart-items />

            <div class="mtm clearfix">
                <div class="floatRight">
                    <cart-totals-table :cart="shoppingCart" />
                </div>
            </div>

            <div class="checkout-buttons" v-if="shoppingCart.num_items">
                <go-to-checkout-buttons />
            </div>
        </div>
    </div>
</template>

<style>
.checkout-buttons {
    text-align: center;
    margin: 20px 0;
}
</style>
