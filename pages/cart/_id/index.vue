<script>
    import isObject from 'lodash.isobject'
    import cloneDeep from 'lodash.clonedeep'


    export default {
        components: {
            CartItems: () => import('@/components/cart/CartItems'),
            CartTotalsTable: () => import('@/components/cart/CartTotalsTable'),
            GoToCheckoutButtons: () => import('@/components/cart/GoToCheckoutButtons')
        },

        data: function() {
            return {
                added_cart_item: null,
                shoppingCart: {}
            }
        },

        methods: {
            cloneCartFromState() {
                this.shoppingCart = cloneDeep(this.$store.state.shoppingcart.cart);
            }
        },

        created() {
            this.cloneCartFromState();

            if(this.$route.params.id) {
                if(isObject(this.shoppingCart) && Array.isArray(this.shoppingCart.cart_items)) {
                    this.shoppingCart.cart_items.forEach((item) => {
                        if(item.product_id === this.$route.params.id) {
                            this.added_cart_item = item.id;
                        }
                    });
                }
            }

            this.$store.dispatch('ui/pageTitle', this.$t('Shopping Cart'));
        },

        head() {
            return {
                title: this.$t('Shopping Cart'),
                meta: [
                    { vmid: 'description', name: 'description', content: `Your Shopping Cart at ${this.$store.state.ui.siteName}` }
                ]
            }
        }
    }
</script>


<template>
    <div class="pageContainerMax">
        <div class="checkout-buttons" v-if="shoppingCart.cart_items && shoppingCart.cart_items.length > 2">
            <go-to-checkout-buttons />
        </div>

        <cart-items
            :shopping-cart="shoppingCart"
            :highlight-item="added_cart_item"
            v-on:updated="cloneCartFromState"></cart-items>

        <div class="mtm clearfix">
            <div class="floatRight">
                <cart-totals-table :cart="shoppingCart"></cart-totals-table>
            </div>
        </div>

        <div class="checkout-buttons" v-if="shoppingCart.num_items">
            <go-to-checkout-buttons />
        </div>
    </div>
</template>

<style lang="scss">
    .checkout-buttons {
        text-align: center;
        margin: 20px 0;
    }
</style>
