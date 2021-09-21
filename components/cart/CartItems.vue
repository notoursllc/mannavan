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
        }
    },

    data() {
        return {
            loading: false,
            cart_items: []
        };
    },

    computed: {
        numCartItems() {
            return isObject(this.$store.state.cart) ? this.$store.state.cart.num_items : 0;
        }
    },

    created() {
        this.getCart();
    },

    methods: {
        async getCart() {
            if(this.$store.state.cart.id) {
                this.loading = true;

                const res = await this.$api.cart.get({
                    id: this.$store.state.cart.id,
                    relations: true
                });

                this.cart_items = isObject(res) ? res.cart_items : [];

                this.loading = false;
            }
        }
    }
};
</script>


<template>
    <div v-if="numCartItems">
        <cart-item
            v-for="(item, index) in cart_items"
            :key="item.id"
            :item="item"
            :edit-mode="allowEdit"
            :image-loading="index > 5 ? 'lazy' : 'eager'"
            @updated="getCart" />
    </div>
</template>
