<script>
import IconTimesSquare from '@/components/icons/IconTimesSquare';
import cloneDeep from 'lodash.clonedeep'

export default {
    name: 'CartItems',

    props: {
        allowEdit: {
            type: Boolean,
            default: true
        }
    },

    components: {
        CartItem: () => import('@/components/cart/CartItem'),
        KeepShoppingButton: () => import('@/components/cart/KeepShoppingButton'),
        IconTimesSquare
    },

    computed: {
        shoppingCart() {
            return cloneDeep(this.$store.state.shoppingcart.cart);
        }
    }
}
</script>


<template>
    <div v-if="shoppingCart">
        <div v-if="!shoppingCart.num_items" class="fs16 tac pal">
            {{ $t('Your shopping cart does not contain any items.') }}
            <div class="mtl">
                <keep-shopping-button />
            </div>
        </div>

        <div v-else class="ptl">
            <div v-for="item in shoppingCart.cart_items" :key="item.id">
                <cart-item
                    :data="item"
                    :edit-mode="allowEdit" />
            </div>
        </div>
    </div>
</template>
