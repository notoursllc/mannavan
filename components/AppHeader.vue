<script>
import { mapGetters } from 'vuex';
import { headroom } from 'vue-headroom';
import product_mixin from '@/mixins/product_mixin';
import AppHeaderCheckoutPopover from '@/components/AppHeaderCheckoutPopover';

import {
    FigBadge,
    FigVictoryIcon
} from '@notoursllc/figleaf';

export default {
    components: {
        AppHeaderCheckoutPopover,
        headroom,
        FigBadge,
        FigVictoryIcon
    },

    mixins: [
        product_mixin
    ],

    data: function() {
        return {
            productAddedToCart: {
                showPopover: false,
                product: null
            }
        };
    },

    computed: {
        ...mapGetters({
            numCartItems: 'shoppingcart/numItems',
            inCheckoutFlow: 'ui/inCheckoutFlow'
        }),

        productSubTypes() {
            return this.$store.state.product.subTypes;
        }
    },

    created() {
        const onProductAddedToCart = (product) => {
            this.productAddedToCart.product = product;
            this.productAddedToCart.showPopover = true;
        };

        this.$nuxt.$on('PRODUCT_ADDED_TO_CART', onProductAddedToCart)

        this.$once('hook:beforeDestroy', () => {
            this.$nuxt.$off('PRODUCT_ADDED_TO_CART', onProductAddedToCart);
        });
    }
};
</script>

<template>
    <headroom :disabled="inCheckoutFlow" :zIndex="10">

        <header role="banner" class="h-12 md:h-16 flex items-center relative p-0 bg-white border-b border-gray-300 w-full duration-500">
            <div class="content-wrap flex flex-row items-center w-full px-4 md:px-2 lg:px-0">
                <!-- common header -->
                <template v-if="!inCheckoutFlow">
                    <!-- logo -->
                    <div>
                        <fig-victory-icon
                            class="vam hidden md:inline-block"
                            fill="#565656"
                            :width="60"
                            :height="30" />

                        <fig-icon
                            icon="chevrons-right"
                            :width="40"
                            :height="40"
                            :stroke-width="1"
                            class="sm:inline-block md:hidden cursor-pointer"
                            @click="$store.dispatch('ui/toggleSidebar')" />
                    </div>

                    <!-- nav -->
                    <nav class="mx-auto flex flex-no-wrap items-center text-base justify-center">
                        <nuxt-link
                            v-for="(obj, type) in productSubTypes"
                            :key="obj.id"
                            :to="{ name: 'productSubType', params: { productSubType: obj.slug } }"
                            tag="a"
                            class="bv-header-nav-item font-semibold relative text-center md:mr-20 sm:mr-10 mr-5"
                            active-class="active">{{ $t(type) }}</nuxt-link>

                        <nuxt-link
                            :to="{ name: 'index' }"
                            tag="a"
                            class="bv-header-nav-item cursorPointer fw600"
                            active-class="active"
                            :exact="true">{{ $t('All') }}</nuxt-link>
                    </nav>

                    <!-- left -->
                    <button
                        type="button"
                        class="cart-button relative p-0 m-0 mt-2 bg-transparent border-0 mr-3 lg:mr-0"
                        :class="{'bounce': numCartItems}">
                        <fig-icon
                            icon="cart"
                            :width="27"
                            :height="27"
                            :stroke-width="1.5" />
                        <fig-badge
                            :variant="numCartItems ? 'success' : 'light'"
                            size="sm">{{ numCartItems }}</fig-badge>
                    </button>
                </template>

                <!-- checkout header -->
                <template v-else>
                    <div>
                        <app-header-checkout-popover>
                            <fig-victory-icon
                                fill="#565656"
                                :width="60"
                                :height="30" />
                        </app-header-checkout-popover>
                    </div>

                    <div class="mx-auto flex flex-no-wrap items-center justify-center">
                        <span class="pr-2 text-xl">{{ $t('Checkout') }}</span>
                        <app-header-checkout-popover>
                            (<a class="whitespace-nowrap text-xl">{{ numCartItems }}&nbsp;{{ $tc('items', numCartItems) }}</a>)
                        </app-header-checkout-popover>
                    </div>

                    <div>
                        <fig-icon
                            icon="lock"
                            class="vam"
                            :width="36"
                            :height="36"
                            :stroke-width="1.5" />
                    </div>
                </template>
            </div>
        </header>
    </headroom>
</template>


<style lang="postcss" scoped>
header:after {
    background: linear-gradient(to right, #e84f47 30%, #ffcd02 31%, #ffcd02 66%, #0792d8 67%, #0792d8 100%);
    content: '';
    height: 1px;
    @apply right-0 left-0 top-0 absolute;
}

.cart-button .fig-badge {
    top: -10px;
    right: -11px;
}

header nav a {
    @apply px-2 py-1 rounded text-blue-700 border-transparent;
}
header nav a:hover {
    @apply bg-blue-200 no-underline;
}
header nav a.nuxt-link-exact-active {
    @apply bg-blue-700 text-white;
}
</style>
