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

    data() {
        return {
            loading: false,
            cart: {}
        };
    },

    computed: {
        numCartItems() {
            return this.$store.state.cart.num_items;
        }
    },

    created() {
        this.getCart();
    },

    methods: {
        async getCart() {
            if(this.$store.state.cart.id) {
                this.loading = true;

                this.cart = await this.$api.cart.get({
                    id: this.$store.state.cart.id,
                    relations: true
                });

                this.loading = false;
            }
        }
    }
};
</script>


<template>
    <div v-if="numCartItems">
        <cart-item
            v-for="(item, index) in cart.cart_items"
            :key="item.id"
            :index="index"
            :item="item"
            :edit-mode="allowEdit"
            @updated="getCart" />
    </div>
</template>
