<script>
import product_mixin from '@/mixins/product_mixin';
import shopping_cart_mixin from '@/mixins/shopping_cart_mixin';
import IconTimesSquare from '@/components/icons/IconTimesSquare';

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
        ProductPrice: () => import('@/components/product/ProductPrice'),
        ProductQuantityInput: () => import('@/components/product/ProductQuantityInput'),
        CartItemDisplay: () => import('@/components/cart/CartItemDisplay'),
        ProductDetailsLayout: () => import('@/components/product/details/ProductDetailsLayout'),
        ProductImageCarousel: () => import('@/components/product/ProductImageCarousel'),
        KeepShoppingButton: () => import('@/components/cart/KeepShoppingButton'),
        IconTimesSquare
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
                const loadingInstance = this.$loadingService({ target: `#cartItem${item.id}` });
                const updateConfig = {
                    id: item.id,
                    qty: item.qty
                };

                const response = await this.updateItemQty(updateConfig);

                this.setCartAndTokenStateFromResponse(response);
                this.$emit('updated');
                loadingInstance.close();
            }
            catch(err) {
                this.$errorMessage(
                    this.$t('An error occurred'),
                    { closeOthers: true }
                );

                this.$bugsnag.notify(err, {
                    request: {
                        updateItemQty: updateConfig
                    }
                });
            }
        },

        async removeItem(id) {
            try {
                const loadingInstance = this.$loadingService({ target: `#cartItem${id}` });

                const response = await this.deleteItem({ id });
                this.setCartAndTokenStateFromResponse(response);
                this.$emit('updated');
                loadingInstance.close();
            }
            catch(err) {
                this.$errorMessage(
                    this.$t('An error occurred'),
                    { closeOthers: true }
                );

                this.$bugsnag.notify(err, {
                    request: { deleteItem: { id: id } }
                });
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

            <div class="mtl">
                <keep-shopping-button></keep-shopping-button>
            </div>
        </div>
        <div v-else class="ptl">
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

                <template slot="delete-button" v-if="allowEdit">
                    <el-popover
                        v-model="confirmDeleteModals[item.id]"
                        width="200"
                        trigger="click"
                        placement="bottom-start">
                        <div class="tac">{{ $t('Remove this item?') }}</div>
                        <div class="tac mtm">
                            <el-button
                                type="primary"
                                size="mini"
                                @click="confirmDeleteModals[item.id] = false; removeItem(item.id)">{{ $t('CONFIRM') }}</el-button>

                            <el-button
                                size="mini"
                                type="text"
                                @click="confirmDeleteModals[item.id] = false">{{ $t('cancel') }}</el-button>
                        </div>

                        <span class="cursorPointer" slot="reference">
                            <el-tooltip
                                effect="light"
                                :content="$t('Remove item from cart')"
                                placement="top-start">
                                <icon-times-square
                                    icon-name="times"
                                    class-name="fillGrayLight"
                                    width="20px"
                                    class="status-icon" />
                            </el-tooltip>
                        </span>
                    </el-popover>
                </template>

                <!-- title -->
                <template slot="title">
                    <el-tooltip
                        effect="light"
                        :content="$t('Product quick view')"
                        placement="top-start">
                        <a class="underlineDotted" @click="showProductDetailsDialog(item)">{{ item.product.title }}</a>
                    </el-tooltip>
                </template>

                <!-- size -->
                <template slot="size">
                    {{ $t(item.variants.size) }}
                </template>

                <!-- price -->
                <template slot="price">
                    <product-price
                        :product="item.product"
                        :show-strikethrough="true"
                        :stacked="false" />
                </template>

                <!-- quantity -->
                <template slot="quantity">
                    <template v-if="allowEdit">
                        <product-quantity-input
                            v-model="item.qty"
                            :sizes="item.product.sizes"
                            :selected-size="item.variants.size"
                            menu-size="mini"
                            :stacked="false"
                            @change="val => { updateCartItemQuantity(item) }" />
                    </template>
                    <template v-else>
                        {{ item.qty }}
                    </template>
                </template>
            </cart-item-display>

            <el-dialog
                :title="productDetailsDialog.cartItem.product.title"
                :visible.sync="productDetailsDialog.visible"
                custom-class="productDialog">

                <div class="pageContainerMax">
                    <product-details-layout>
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
                            {{ $t(productDetailsDialog.cartItem.variants.size) }}
                        </template>

                        <!-- quantity -->
                        <template slot="quantity">
                            {{ productDetailsDialog.cartItem.qty }}
                        </template>
                    </product-details-layout>
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
