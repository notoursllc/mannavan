<script>
import PageTitle from '@/components/PageTitle';
import CartItems from '@/components/cart/CartItems';
import CartTotalsTable from '@/components/cart/CartTotalsTable';
import {
    FigButton,
    FigCartCtaLayout
} from '@notoursllc/figleaf';

export default {
    components: {
        PageTitle,
        CartItems,
        CartTotalsTable,
        FigButton,
        FigCartCtaLayout
    },

    head() {
        return {
            title: this.$t('Shopping Cart'),
            meta: [
                { vmid: 'description', name: 'description', content: `Your Shopping Cart at ${this.$store.state.ui.siteName}` }
            ]
        };
    },

    computed: {
        numCartItems() {
            return this.$store.state.cart.cart.num_items;
        }
    },

    methods: {
        onClickCheckout() {
            this.$router.push({ name: 'cart-checkout' });
        }
    }
};
</script>


<template>
    <div>
        <page-title>{{ $t('Shopping Cart') }}</page-title>

        <div v-if="!numCartItems" class="text-base">
            {{ $t('Your shopping cart does not contain any items.') }}
        </div>

        <fig-cart-cta-layout v-else>
            <template slot="left">
                <cart-items />
            </template>

            <template slot="right">
                <div class="mb-4">
                    <cart-totals-table
                        sales-tax-on-next-step
                        shipping-on-next-step />
                </div>

                <fig-button
                    variant="primary"
                    size="lg"
                    @click="onClickCheckout"
                    class="w-full">{{ $t('Checkout') }}</fig-button>
            </template>
        </fig-cart-cta-layout>
    </div>
</template>
