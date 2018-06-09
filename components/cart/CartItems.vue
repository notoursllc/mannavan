<script>
    import accounting from 'accounting'
    import Vue from 'vue'
    import { mapGetters } from 'vuex'
    import isObject from 'lodash.isobject'
    import { Select, Option, InputNumber, Loading, Button, Popover, Notification } from 'element-ui'
    import ProductPrice from '@/components/product/ProductPrice'
    import NumberButtons from '@/components/NumberButtons'
    import product_mixin from '@/mixins/product_mixin'
    import shopping_cart_mixin from '@/mixins/shopping_cart_mixin'

    Vue.use(Select);
    Vue.use(Option);
    Vue.use(InputNumber);
    Vue.use(Button);
    Vue.use(Popover);
    Vue.use(Loading.directive);

    Vue.prototype.$notify = Notification;
    let currentNotification = null;


    function showNotification(Notification) {
        if(currentNotification) {
            currentNotification.close();
        }
        currentNotification = Notification
    }


    export default {
        props: {
            allowEdit: {
                type: Boolean,
                default: true
            },

            highlightItem: {
                type: String,
                default: null
            }
        },

        components: {
            ProductPrice,
            NumberButtons
        },

        mixins: [
            product_mixin,
            shopping_cart_mixin
        ],

        data() {
            return {
                added_cart_item: {},
                selectedQty: 0,
                loading: true,
                deleteConfirmVisible: false
            }
        },

        computed: {
            ...mapGetters({
                shoppingCart: 'shoppingcart/cart'
            })
        },

        methods: {
            async updateCartItemQuantity(item, qty) {
                try {
                    const loadingInstance = Loading.service({ target: `#cartItem${item.id}` });

                    const cartData = await this.updateItemQty({
                        id: item.id,
                        qty
                    });

                    this.$store.dispatch('shoppingcart/CART_SET', cartData);
                    item.qty = qty;
                    loadingInstance.close();
                }
                catch(err) {
                    showNotification(
                        this.$notify({
                            type: 'error',
                            title: this.$t('An error occurred'),
                            duration: 0
                        })
                    )
                }
            },

            async removeItem(id) {
                try {
                    const loadingInstance = Loading.service({ target: `#cartItem${id}` });
                    const cartData = await this.deleteItem({ id });

                    this.$store.dispatch('shoppingcart/CART_SET', cartData);
                    loadingInstance.close();
                }
                catch(err) {
                    showNotification(
                        this.$notify({
                            type: 'error',
                            title: this.$t('An error occurred'),
                            duration: 0
                        })
                    )
                }
            }
        },

        mounted() {
            setTimeout(() => {
                this.added_cart_item = this.highlightItem;
            }, 1000)
        }
    }
</script>


<template>
    <div>
        <div v-if="!shoppingCart.num_items" class="fs16 tac pal">
            {{ $t('Your shopping cart does not contain any items.') }}
        </div>
        <div v-else class="ptl">
            <article v-for="item in shoppingCart.cart_items"
                    :key="item.id"
                    class="cartItem"
                    :class="{'highlight': highlightItem === item.id, 'fadeout': added_cart_item === item.id}"
                    :id="'cartItem' + item.id">
                <div class="cartItemPic">
                    <figure class="image is-128x128">
                        <img v-bind:src="featuredProductPic(item.product)">
                    </figure>
                </div>

                <div class="cartItemInfo">
                    <div class="cartItemInfoContent">
                        <div class="cartItemMain">
                            <nuxt-link :to="{ name: 'type-name-seouri', params: { seouri: item.product.seo_uri} }"
                                tag="a"
                                class="itemTitle">{{ item.product.title }}</nuxt-link>

                            <div v-if="allowEdit" class="mts">
                                <el-popover
                                    placement="top"
                                    width="200"
                                    v-model="deleteConfirmVisible">
                                    <div>{{ $t('Delete this item?') }}</div>
                                    <div class="tar mtm">
                                        <el-button size="mini"
                                            type="text"
                                            @click="deleteConfirmVisible = false">{{ $t('cancel') }}</el-button>

                                        <el-button type="primary"
                                            size="mini"
                                            @click="deleteConfirmVisible = false; removeItem(item.id)">{{ $t('CONFIRM') }}</el-button>
                                    </div>
                                    <el-button slot="reference" type="text">{{ $t('Delete') }}</el-button>
                                </el-popover>
                            </div>
                        </div>

                        <!-- Variants -->
                        <div class="cartItemCol">
                            <div v-if="item.variants && item.variants.size">
                                <label class="itemLabel">{{ $t('Size') }}:</label>
                                <div class="itemVal">{{ $t(item.variants.size) }}</div>
                            </div>
                        </div>

                        <!-- Price -->
                        <div class="cartItemCol">
                            <label class="itemLabel">{{ $t('Price' )}}:</label>
                            <div class="itemVal"><product-price :product="item.product"></product-price></div>
                        </div>

                        <!-- Quantity -->
                        <div class="cartItemCol">
                            <label class="itemLabel">{{ $t('Quantity' )}}:</label>
                            <div v-if="allowEdit" class="itemVal">
                                <div class="displayTableCell prl fwb vat">{{ item.qty }}</div>
                                <div class="displayTableCell">
                                    <number-buttons :step="1"
                                                    :min="1"
                                                    :max="item.product.inventory_count"
                                                    :init-value="item.qty"
                                                    size="small"
                                                    v-on:change="val => {updateCartItemQuantity(item, val)}"></number-buttons>
                                </div>
                            </div>
                            <div v-else class="itemVal">
                                {{ item.qty }}
                            </div>
                        </div>
                    </div>
                </div>
            </article>
        </div>
    </div>
</template>
