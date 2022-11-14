<script>
import PageTitle from '@/components/PageTitle';
import CartItem from '@/components/cart/CartItem';
import CartTotalsTable from '@/components/cart/CartTotalsTable';
import {
    FigButton,
    FigCartCtaLayout,
    FigSpinner,
    FigContent
} from '@notoursllc/figleaf';

export default {
    components: {
        PageTitle,
        CartItem,
        CartTotalsTable,
        FigButton,
        FigCartCtaLayout,
        FigSpinner,
        FigContent
    },

    data() {
        return {
            loading: true,
            cart: null
        };
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
            return this.cart?.num_items;
        }
    },

    mounted() {
        this.getCart();
    },

    methods: {
        onClickCheckout() {
            this.$router.push({ name: 'cart-checkout' });
        },

        async getCart() {
            if(this.$store.state.cart.id) {
                this.loading = true;

                const response = await this.$api.cart.get({
                    id: this.$store.state.cart.id,
                    _withRelated: '*'
                });

                // this.cart_items = isObject(data) ? data.cart_items : [];
                this.cart = response.data
                this.loading = false;
            }
        }
    }
};
</script>


<template>
    <fig-content size="lg">
        <page-title>{{ $t('Shopping Cart') }}</page-title>

        <template v-if="loading">
            <fig-spinner :width="40" />
        </template>

        <template v-else>
            <div v-if="!numCartItems" class="text-base">
                {{ $t('Your shopping cart does not contain any items.') }}
            </div>

            <fig-cart-cta-layout v-else>
                <template slot="left">
                    <div v-if="numCartItems">
                        <cart-item
                            v-for="(item, index) in cart.cart_items"
                            :key="item.id"
                            :item="item"
                            :edit-mode="true"
                            :image-loading="index > 5 ? 'lazy' : 'eager'"
                            @updated="getCart" />
                    </div>
                </template>

                <template slot="right">
                    <div class="mb-4">
                        <cart-totals-table
                            :cart="cart"
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
        </template>
    </fig-content>
</template>
