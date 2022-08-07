<script>
import isObject from 'lodash.isobject';
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
        },

        cart: {
            type: Object,
            default() {
                return {}
            }
        }
    },

    computed: {
        numCartItems() {
            return isObject(this.$store.state.cart) ? this.$store.state.cart.num_items : 0;
        },

        cartItems() {
            return this.cart.cart_items || []
        }
    },

    methods: {
        emitUpdated() {
            this.$emit('updated');
        }
    }
};
</script>


<template>
    <div v-if="numCartItems">
        <cart-item
            v-for="(item, index) in cartItems"
            :key="item.id"
            :item="item"
            :edit-mode="allowEdit"
            :image-loading="index > 5 ? 'lazy' : 'eager'"
            @updated="emitUpdated" />
    </div>
</template>
