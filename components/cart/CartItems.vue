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
                confirmDeleteModals: {}
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

                    const response = await this.updateItemQty({
                        id: item.id,
                        qty
                    });
                    this.setCartAndTokenStateFromResponse(response);

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

                    const response = await this.deleteItem({ id });
                    this.setCartAndTokenStateFromResponse(response);

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
                <div class="cartItemPic" :style="'background-image:url(' + featuredProductPic(item.product) + ');'">
                    <figure class="image"></figure>
                </div>
                <!-- <div class="cartItemPicMobile" :style="'background-image:url(' + featuredProductPic(item.product) + ');'">foo</div> -->

                <div class="cartItemInfo">
                    <div class="cartItemInfoContent">
                        <div class="cartItemMain">
                            <nuxt-link :to="{ name: 'type-name-seouri', params: { seouri: item.product.seo_uri} }"
                                tag="a"
                                class="itemTitle">{{ item.product.title }}</nuxt-link>

                            <div v-if="allowEdit" class="mts">
                                <el-popover
                                    width="200"
                                    v-model="confirmDeleteModals[item.id]"
                                    trigger="click"
                                    placement="start/right-end">
                                    <div>{{ $t('Delete this item?') }}</div>
                                    <div class="tar mtm">
                                        <el-button
                                            type="primary"
                                            size="mini"
                                            @click="confirmDeleteModals[item.id] = false; removeItem(item.id)">{{ $t('CONFIRM') }}</el-button>

                                        <el-button
                                            size="mini"
                                            type="text"
                                            @click="confirmDeleteModals[item.id] = false">{{ $t('cancel') }}</el-button>
                                    </div>
                                    <el-button
                                        slot="reference"
                                        type="text"
                                        @click="confirmDeleteModals[item.id] = true">{{ $t('Delete') }}</el-button>
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
