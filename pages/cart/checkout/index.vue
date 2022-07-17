<script>
import CartTotalsTable from '@/components/cart/CartTotalsTable';
import CartItemMini from '@/components/cart/CartItemMini';
import CartShippingAddressDetails from '@/components/cart/CartShippingAddressDetails.vue';
import CheckoutAddressForm from '@/components/cart/checkout/CheckoutAddressForm.vue';
import CheckoutShippingRates from '@/components/cart/checkout/CheckoutShippingRates.vue';
import CheckoutPaymentForm from '@/components/cart/checkout/CheckoutPaymentForm.vue';
import {
    FigButton,
    FigOverlay,
    FigTextCard,
    FigCartCtaLayout,
    FigDivider,
    FigIcon,
    FigContent
} from '@notoursllc/figleaf';

import { loadStripe } from '@stripe/stripe-js/pure';
loadStripe.setLoadParameters({ advancedFraudSignals: false }) // https://github.com/stripe/stripe-js#disabling-advanced-fraud-detection-signals


export default {
    components: {
        FigButton,
        FigOverlay,
        FigTextCard,
        FigCartCtaLayout,
        FigDivider,
        FigIcon,
        FigContent,
        CartTotalsTable,
        CartItemMini,
        CheckoutAddressForm,
        CartShippingAddressDetails,
        CheckoutShippingRates,
        CheckoutPaymentForm
    },

    data: function() {
        return {
            Stripe: null,
            loading: false,
            step: 1,
            Stripe: null,
            cart: {}
        };
    },

    head() {
        return {
            title: this.$t('Checkout'),
            meta: [
                { vmid: 'description', name: 'description', content: `Your Shopping Cart at ${this.$store.state.ui.siteName}` }
            ]
        };
    },

    computed: {
        numCartItems() {
            return this.$store.state.cart.num_items;
        },

        cartFromState() {
            console.log("CART FROM STATE", this.$store.state.cart)
            return this.$store.state.cart;
        }
    },

    async mounted() {
        this.Stripe = await loadStripe(this.$config.stripePublishableKey);
        await this.getCart();
    },

    methods: {
        /**
         * Steps:
         * 1) Shipping form view
         * 2) Shipping details view && shipping rate selection view
         * 3) Payment form view
         */
        goToStep(stepNumber) {
            this.step = stepNumber;
        },

        onUpdatedCart(data) {
            this.cart = { ...data };
            this.$store.dispatch('cart/CART', data);
        },

        onCheckoutAddressFormDone(updatedCart) {
            this.onUpdatedCart(updatedCart);
            this.goToStep(2);
        },

        onShippingRateSelectDone(updatedCart) {
            this.onUpdatedCart(updatedCart);
            this.goToStep(3);
        },

        async getCart() {
            if(this.$store.state.cart.id) {
                this.loading = true;

                const { data } = await this.$api.cart.get({
                    id: this.$store.state.cart.id,
                    _withRelated: '*'
                });

                this.onUpdatedCart(data);
                this.loading = false;
            }
        }
    }
};
</script>

<template>
    <fig-content size="lg" class="pt-6">

        <div v-if="!numCartItems" class="text-center text-lg">
            {{ $t('Your shopping cart does not contain any items.') }}
        </div>

        <fig-cart-cta-layout
            v-else
            right-first-on-break>
            <template slot="left">

                <!-- DELIVERY OPTIONS CARD-->
                <fig-text-card variant="dark" class="mb-4">
                    <div slot="header-left" class="flex items-center font-semibold p-1 uppercase">
                        <fig-icon
                            v-if="step === 3"
                            icon="check-circle"
                            :width="24"
                            :height="24"
                            variant="success"
                            class="mr-2" />
                        1. {{ $t('Delivery options') }}
                    </div>

                    <fig-button
                        v-if="step > 1"
                        slot="header-right"
                        variant="plain"
                        size="sm"
                        @click="goToStep(1)">{{ $t('Edit') }}</fig-button>

                    <div class="p-2">
                        <checkout-address-form
                            v-if="step === 1"
                            :cart="cart"
                            @done="onCheckoutAddressFormDone" />

                        <template v-else>
                            <div class="text-gray-700 text-sm border border-gray-200 p-2 rounded">
                                <cart-shipping-address-details :cart="cart" />
                            </div>

                            <checkout-shipping-rates
                                :cart="cart"
                                @done="onShippingRateSelectDone"
                                :show-selected-rate="step === 3" />
                        </template>
                    </div>
                </fig-text-card>


                <!-- PAYMENT CARD -->
                <fig-text-card
                    v-if="step === 3"
                    variant="dark"
                    class="mb-4">
                    <div slot="header-left" class="font-semibold p-1 uppercase">2. {{ $t('Payment') }}</div>
                    <div class="p-2">
                        <checkout-payment-form
                            :cart="cart"
                            :stripe="Stripe" />
                    </div>
                </fig-text-card>
            </template>


            <template slot="right">
                <fig-text-card variant="light">
                    <div slot="header-left" class="font-semibold p-1 uppercase">{{ $t('Your cart') }}</div>
                    <div slot="header-right" class="text-sm">
                        <nuxt-link to="/cart">{{ $t('Edit') }}</nuxt-link>
                    </div>

                    <div class="text-sm">
                        <cart-totals-table
                            :cart="cart"
                            :shipping="step > 2"
                            :sales-tax="step > 1" />

                        <fig-divider />

                        <div class="cart-item-mini-container">
                            <cart-item-mini
                                v-for="(item, index) in cart.cart_items"
                                :key="item.id"
                                :item="item"
                                :image-loading="index > 5 ? 'lazy' : 'eager'" />
                        </div>
                    </div>
                </fig-text-card>
            </template>
        </fig-cart-cta-layout>
    </fig-content>
</template>
