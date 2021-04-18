<script>
import PageTitle from '@/components/PageTitle';
import CartItems from '@/components/cart/CartItems';
import CartTotalsTable from '@/components/cart/CartTotalsTable';
import { FigButton } from '@notoursllc/figleaf';

export default {
    components: {
        PageTitle,
        CartItems,
        CartTotalsTable,
        FigButton
    },

    computed: {
        numCartItems() {
            return this.$store.state.cart.cart.num_items;
        }
    },

    methods: {
        onClickCheckout() {
            this.$router.push({ name: 'checkout' });
        }
    },

    head() {
        return {
            title: this.$t('Shopping Cart'),
            meta: [
                { vmid: 'description', name: 'description', content: `Your Shopping Cart at ${this.$store.state.ui.siteName}` }
            ]
        };
    }
};
</script>


<template>
    <div class="container mx-auto">
        <page-title>{{ $t('Shopping Cart') }}</page-title>

        <div class="flex flex-wrap overflow-hidden xl:-mx-3">

            <!-- left column -->
            <div class="w-full overflow-hidden xl:my-3 xl:px-3 xl:w-3/4">
                <cart-items v-if="numCartItems" />

                <div v-else class="text-base">
                    {{ $t('Your shopping cart does not contain any items.') }}
                </div>
            </div>

            <!-- right column -->
            <div v-if="numCartItems" class="w-full overflow-hidden xl:my-3 xl:px-3 xl:w-1/4">
                <div class="mb-4">
                    <!-- <cart-totals-table /> -->
                </div>

                <fig-button
                    variant="primary"
                    size="lg"
                    @click="onClickCheckout"
                    class="w-full">{{ $t('Checkout') }}</fig-button>
            </div>

        </div>
    </div>
</template>
