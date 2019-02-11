<script>
import accounting from 'accounting'
import Vue from 'vue'
import { mapGetters } from 'vuex'
import isObject from 'lodash.isobject'
import { Select, Option, InputNumber, Loading, Button, Popover, Notification, Dialog, Tooltip } from 'element-ui'
import ProductPrice from '@/components/product/ProductPrice'
import ProductQuantityInput from '@/components/product/ProductQuantityInput'
import CartItemDisplay from '@/components/cart/CartItemDisplay'
import ProductDetailsDisplay from '@/components/product/ProductDetailsDisplay'
import ProductImageCarousel from '@/components/product/ProductImageCarousel'
import product_mixin from '@/mixins/product_mixin'
import shopping_cart_mixin from '@/mixins/shopping_cart_mixin'

Vue.use(Select);
Vue.use(Option);
Vue.use(InputNumber);
Vue.use(Button);
Vue.use(Popover);
Vue.use(Dialog);
Vue.use(Tooltip);
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
        shoppingCart: {
            type: Object,
            default: null
        },

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
        ProductQuantityInput,
        CartItemDisplay,
        ProductDetailsDisplay,
        ProductImageCarousel
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
            confirmDeleteModals: {},
            productDetailsDialog: {
                visible: false,
                cartItem: {
                    product: {},
                    variants: {}
                }
            }
        }
    },

    methods: {
        async updateCartItemQuantity(item) {
            try {
                const loadingInstance = Loading.service({ target: `#cartItem${item.id}` });

                const response = await this.updateItemQty({
                    id: item.id,
                    qty: item.qty
                });
                this.setCartAndTokenStateFromResponse(response);
                this.$emit('updated');
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
                this.$emit('updated');
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

        showProductDetailsDialog(cartItem) {
            this.productDetailsDialog.visible = true;
            this.productDetailsDialog.cartItem = cartItem;
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
    <div v-if="shoppingCart">
        <div v-if="!shoppingCart.num_items" class="fs16 tac pal">
            {{ $t('Your shopping cart does not contain any items.') }}
        </div>
        <div v-else class="ptl">
            confirmDeleteModals {{ confirmDeleteModals }}
            <cart-item-display
                v-for="item in shoppingCart.cart_items"
                :key="item.id"
                :class="{'highlight': highlightItem === item.id, 'fadeout': added_cart_item === item.id}"
                :id="'cartItem' + item.id">

                <!-- pic -->
                <template slot="pic">
                    <figure class="cartItemPic"
                        :style="'background-image:url(' + featuredProductPic(item.product) + ');'"></figure>
                </template>

                <!-- title -->
                <template slot="title">
                    <el-tooltip
                        effect="light"
                        :content="$t('Product quick view')"
                        placement="top-start">
                        <a class="underlineDotted" @click="showProductDetailsDialog(item)">{{ item.product.title }}</a>
                    </el-tooltip>

                    <div v-if="allowEdit" class="mts">
                        <el-popover
                            v-model="confirmDeleteModals[item.id]"
                            width="200"
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
                                type="text">{{ $t('Delete') }}</el-button>
                        </el-popover>
                    </div>
                </template>

                <!-- size -->
                <template slot="size">
                    {{ $t(item.variants.size) }}
                </template>

                <!-- price -->
                <template slot="price">
                    <product-price :product="item.product" />
                </template>

                <!-- quantity -->
                <template slot="quantity">
                    <div v-if="allowEdit" class="itemVal">
                        <div class="displayTableCell prl fwb vat">{{ item.qty }}</div>
                        <div class="displayTableCell">
                            <product-quantity-input
                                v-model="item.qty"
                                :sizes="item.product.sizes"
                                :selected-size="item.variants.size"
                                button-size="small"
                                v-on:input="val => {updateCartItemQuantity(item)}" />
                        </div>
                    </div>
                    <div v-else class="itemVal">
                        {{ item.qty }}
                    </div>
                </template>
            </cart-item-display>

            <el-dialog
                :title="productDetailsDialog.cartItem.product.title"
                :visible.sync="productDetailsDialog.visible"
                custom-class="productDialog">

                <div class="pageContainerMax">
                    <product-details-display>
                        <!-- pics -->
                        <template slot="pics">
                            <product-image-carousel :product="productDetailsDialog.cartItem.product" />
                        </template>

                        <!-- description -->
                        <template slot="description">
                            <div class="pbl fs16">{{ productDetailsDialog.cartItem.product.description_long }}</div>
                        </template>

                        <!-- price -->
                        <template slot="price">
                            <div class="fs20">
                                <product-price :product="productDetailsDialog.cartItem.product"></product-price>
                            </div>
                        </template>

                        <!-- size -->
                        <template slot="size">
                            <div class="fwb">{{ $t('Size') }}:</div>
                            {{ $t(productDetailsDialog.cartItem.variants.size) }}
                        </template>

                        <!-- quantity -->
                        <template slot="quantity">
                            <div class="fwb">{{ $t('Quantity') }}:</div>
                            {{ productDetailsDialog.cartItem.qty }}
                        </template>
                    </product-details-display>
                </div>
            </el-dialog>
        </div>
    </div>
</template>

<style lang="scss">
    @import "~assets/css/components/_variables.scss";

    .productDialog {
        margin-top: 5vh !important;
        width: 95% !important;
    }

    @media #{$medium-and-up} {
        .productDialog {
            max-width: 1000px;
        }
    }
</style>
