<script>
import Vue from 'vue'
import { mapGetters } from 'vuex'
import KeepShoppingButton from '@/components/cart/KeepShoppingButton'
import app_mixin from '@/mixins/app_mixin'

export default {
    components: {
        KeepShoppingButton
    },

    mixins: [
        app_mixin
    ],

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
    <div class="pageContainerMax fs16 pal tac mtl">
        {{ $t('Your shopping cart does not contain any items.') }}

        <div class="mtl">
            <keep-shopping-button></keep-shopping-button>
        </div>
    </div>
</template>
