<script>
import CurrencyChooser from '@/components/currency/currencyChooser/CurrencyChooser.vue';
import {
    FigHeader,
    FigVictoryIcon
} from '@notoursllc/figleaf';

export default {
    components: {
        CurrencyChooser,
        FigHeader,
        FigVictoryIcon
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
            <div class="pt-1"></div>
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
                    class="bv-header-nav-item font-semibold relative text-center mr-5"
                    active-class="active">{{ $t(type) }}</nuxt-link>
            </nav>
        </template>

        <template v-slot:right>
            <div class="pr-4 md:pr-6">
                <currency-chooser />
            </div>
        </template>
    </fig-header>
</template>


<style>
.fig-header {
    @apply bg-white border-b border-gray-300;
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
