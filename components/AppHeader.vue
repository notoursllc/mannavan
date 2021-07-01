<script>
import { mapGetters } from 'vuex';
import {
    FigHeader,
    FigVictoryIcon
} from '@notoursllc/figleaf';

export default {
    components: {
        FigHeader,
        FigVictoryIcon
    },

    computed: {
        ...mapGetters({
            inCheckoutFlow: 'ui/inCheckoutFlow'
        }),

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
        <div slot="logo" @click="onLogoClick">
            <fig-victory-icon
                class="cursor-pointer"
                fill="#565656"
                :width="60"
                :height="30" />
        </div>

        <nav slot="middle">
            <nuxt-link
                v-for="(obj, type) in productSubTypes"
                :key="obj.id"
                :to="{ name: 'productSubType', params: { productSubType: obj.slug } }"
                tag="a"
                class="bv-header-nav-item font-semibold relative text-center mr-5"
                active-class="active">{{ $t(type) }}</nuxt-link>
        </nav>
    </fig-header>
</template>


<style lang="postcss">
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
</style>
