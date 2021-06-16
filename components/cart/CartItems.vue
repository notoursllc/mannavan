<script>
import CartItem from '@/components/cart/CartItem';

export default {
    name: 'CartItems',

    components: {
        CartItem
    },

    props: {
        allowEdit: {
            type: Boolean,
            default: true
        }
    },

    computed: {
        numCartItems() {
            return this.$store.state.cart.num_items;
        }
    },

    methods: {
        onItemSizeChange(index, newSize) {
            console.log("ITEMS - onItemSizeChange", index, newSize)
            //TODO: API request to update cart
        },

        onItemQuantityChange(index, newQty) {
            console.log("ITEMS - onItemQuantityChange", index, newQty);
            //TODO: API request to update cart
        }
    }
};
</script>


<template>
    <div v-if="numCartItems">
        <cart-item
            v-for="(item, index) in $store.state.cart.cart_items"
            :key="item.id"
            :index="index"
            :item="item"
            :edit-mode="allowEdit"
            @size="(s) => { onItemSizeChange(index, s) }"
            @quantity="(q) => { onItemQuantityChange(index, q) }" />
    </div>
</template>
