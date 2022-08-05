<script>
import CurrencySymbol from '@/components/CurrencySymbol.vue';
import {
    FigHeader,
    FigVictoryIcon,
    FigDropdown,
    FigDropdownButton,
    FigButton
} from '@notoursllc/figleaf';

export default {
    components: {
        CurrencySymbol,
        FigHeader,
        FigVictoryIcon,
        FigDropdown,
        FigDropdownButton,
        FigButton
    },

    computed: {
        inCheckoutFlow() {
            return this.$route.path?.substring(0, 14) === '/cart/checkout';
        },

        productSubTypes() {
            return this.$store.state.product.subTypes;
        },

        numCartItems() {
            return this.$store.state.cart.num_items;
        },

        cartCurrency() {
            return this.$store.state.cart.currency || this.defaultExchangeRate;
        },

        defaultExchangeRate() {
            return this.$store.state.ui.exchangeRates?.default || 'USD';
        },

        exchangeRates() {
            const rates = this.$store.state.ui.exchangeRates?.rates || {};
            let filteredRates = {};

            if(rates) {
                filteredRates = { ...rates };
                delete filteredRates[this.cartCurrency];
            }

            return Object.keys(filteredRates);
        }
    },

    methods: {
        onCartButtonClick() {
            this.$router.push({ name: 'cart' });
        },

        onSidebarOpen() {
            this.$store.dispatch('ui/toggleSidebar');
        },

        onLogoClick() {
            this.$router.push({ name: 'index' });
        },

        async onExchangeRateClick(val) {
            if(this.exchangeRates.includes(val)) {
                this.$store.dispatch('cart/CART_CURRENCY', val);

                const cartId = this.$store.state.cart.id;

                if(cartId) {
                    try {
                        const { data } = await this.$api.cart.currency({
                            id: cartId,
                            currency: val
                        });

                        await Promise.all([
                            this.$store.dispatch('cart/CART', data.cart),
                            this.$store.dispatch('ui/EXCHANGE_RATES', data.exchange_rates)
                        ]);
                    }
                    catch(err) {
                        // no action
                    }
                }
            }
        }
    }
};
</script>

<template>
    <fig-header
        :in-checkout="inCheckoutFlow"
        :num-cart-items="numCartItems"
        @cartClick="onCartButtonClick"
        @sidebarOpen="onSidebarOpen">
        <template v-slot:top>
            <!-- currency chooser -->
            <div class="flex px-2 py-2">
                <div class="flex-grow"></div>
                <div>
                    <fig-dropdown>
                        <template v-slot:toggler>
                            <fig-button variant="naked">
                                <currency-symbol :currency="cartCurrency" /> {{ cartCurrency }}
                            </fig-button>
                        </template>

                        <fig-dropdown-button
                            v-for="(rate, idx) in exchangeRates"
                            :key="idx"
                            @click="onExchangeRateClick(rate)">
                            <currency-symbol :currency="rate" /> {{ rate }}
                        </fig-dropdown-button>
                    </fig-dropdown>
                </div>
            </div>
        </template>

        <template v-slot:logo>
            <div @click="onLogoClick">
                <fig-victory-icon
                    class="cursor-pointer"
                    fill="#565656"
                    :width="60"
                    :height="30" />
            </div>
        </template>

        <template v-slot:middle>
            <nav>
                <nuxt-link
                    v-for="(obj, type) in productSubTypes"
                    :key="obj.id"
                    :to="{ name: 'productSubType', params: { productSubType: obj.slug } }"
                    tag="a"
                    class="bv-header-nav-item font-semibold relative text-center mr-5"
                    active-class="active">{{ $t(type) }}</nuxt-link>
            </nav>
        </template>
    </fig-header>
</template>


<style>
.fig-header {
    @apply bg-white border-b border-gray-300;
}
.fig-header:after {
    /* background: linear-gradient(to right, #e14e2c 30%, #eb7d32 31%, #eb7d32 66%, #efc243 67%, #efc243 100%); */
    /* background: linear-gradient(to right, #7ec3d4 30% ,#cceaf1 31%, #cceaf1 66%, #7ec3d4 67%, #7ec3d4 100%); */
    background: #9cdff0;
    content: '';
    height: 1px;
    @apply right-0 left-0 top-0 absolute;
}
.fig-header nav a {
    @apply px-2 py-1 rounded text-gray-700 border-transparent;
}
.fig-header nav a:hover {
    @apply bg-blue-200 no-underline;
}
.fig-header nav a.nuxt-link-exact-active {
    @apply text-white;
    background: #ff7101;
}

.fig-header-top {
    @apply text-sm;
    background: #cceaf1;
}
</style>
