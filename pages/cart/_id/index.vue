<script>
    import Vue from 'vue'
    import { mapGetters } from 'vuex'
    import isObject from 'lodash.isobject'
    import { Button } from 'element-ui'
    import PageHeader from '@/components/PageHeader.vue'
    import CartItems from '@/components/cart/CartItems'
    import CartTotalsTable from '@/components/cart/CartTotalsTable'
    import KeepShoppingButton from '@/components/cart/KeepShoppingButton'
    import app_mixin from '@/mixins/app_mixin'

    Vue.use(Button);

    export default {
        components: {
            CartItems,
            CartTotalsTable,
            PageHeader,
            KeepShoppingButton
        },

        mixins: [
            app_mixin
        ],

        computed: {
            ...mapGetters({
                shoppingCart:'shoppingcart/cart'
            })
        },

        data: function() {
            return {
                added_cart_item: null
            }
        },

        methods: {
            goToCheckout() {
                this.$router.push({ name: 'cart-checkout' });
            },
        },

        created() {
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
                    { vmid: 'description', name: 'description', content: `Your Shopping Cart at ${this.getSiteName()}` }
                ]
            }
        }
    }
</script>


<template>
    <div class="pageContainerMax">
        <div class="tac ptl" v-if="this.shoppingCart.cart_items && this.shoppingCart.cart_items.length > 2">
            <el-button type="success"
                        size="large"
                        @click="goToCheckout"
                        round>{{ $t('PROCEED TO CHECKOUT') }}</el-button>
        </div>

        <cart-items :highlight-item="added_cart_item"></cart-items>

        <div class="mtm clearfix">
            <div class="floatRight">
                <cart-totals-table :cart="shoppingCart"></cart-totals-table>
            </div>
        </div>

        <div class="tac mtl" v-if="this.shoppingCart.num_items">
            <el-button type="success"
                        size="large"
                        @click="goToCheckout"
                        round>{{ $t('PROCEED TO CHECKOUT') }}</el-button>

            <div class="mvl colorGray">{{ $t('OR') }}</div>
        </div>

        <div class="tac">
            <keep-shopping-button></keep-shopping-button>
        </div>
    </div>
</template>
