<script>
import { mapGetters } from 'vuex';

export default {
    components: {
        PageTitle: () => import('@/components/PageTitle')
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
    <div>
        <page-title>{{ $t('Secure Checkout') }}</page-title>

        <div class="pageContainerMax fs16 pal tac mtl">
            {{ $t('Your shopping cart does not contain any items.') }}
        </div>
    </div>
</template>
