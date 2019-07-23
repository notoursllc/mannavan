<script>
import { mapGetters } from 'vuex'

export default {
    components: {
        KeepShoppingButton: () => import('@/components/cart/KeepShoppingButton')
    },

    computed: {
        ...mapGetters({
            shoppingCart: 'shoppingcart/cart',
        })
    },

    created: function() {
        if(this.shoppingCart.num_items) {
            this.$router.push({ name: 'cart-checkout' });
            return;
        }

        this.$store.dispatch('ui/IN_CHECKOUT_FLOW', true);
        this.$store.dispatch('ui/pageTitle', this.$t('Secure Checkout'));
    },

    head() {
        return {
            title: this.$t('Secure Checkout'),
            meta: [
                { vmid: 'description', name: 'description', content: `Your Shopping Cart at ${this.$store.state.ui.siteName}` }
            ]
        }
    }
}
</script>


<template>
    <div class="pageContainerMax fs16 pal tac mtl">
        {{ $t('Your shopping cart does not contain any items.') }}

        <div class="mtl">
            <keep-shopping-button></keep-shopping-button>
        </div>
    </div>
</template>
