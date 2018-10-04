<script>
import Vue from 'vue'
import { Dialog } from 'element-ui'
import ProductPrice from '@/components/product/ProductPrice'
import ProductDetailsDisplay from '@/components/product/ProductDetailsDisplay'
import ProductImageCarousel from '@/components/product/ProductImageCarousel'
import CartItemDisplay from '@/components/cart/CartItemDisplay'
import product_mixin from '@/mixins/product_mixin'

Vue.use(Dialog)

export default {
    props: {
        cartItems: {
            type: Array,
            required: true
        }
    },

    components: {
        ProductDetailsDisplay,
        ProductPrice,
        ProductImageCarousel,
        CartItemDisplay
    },

    mixins: [
        product_mixin,
    ],

    data: function() {
        return {
            dialogVisible: false,
            dialogCartItem: {
                product: {},
                variants: {}
            }
        }
    },

    methods: {
        showDialog(cartItem) {
            this.dialogVisible = true;
            this.dialogCartItem = cartItem;
        }
    }
}
</script>

<template>
    <div>

        <cart-item-display
            v-for="item in cartItems"
            :key="item.id">

            <!-- pic -->
            <template slot="pic">
                <figure class="cartItemPic"
                    :style="'background-image:url(' + featuredProductPic(item.product) + ');'"></figure>
            </template>

            <!-- title -->
            <template slot="title">
                <a class="itemTitle" @click="showDialog(item)">{{ item.product.title }}</a>
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
                {{ item.qty }}
            </template>
        </cart-item-display>


        <el-dialog
            :title="dialogCartItem.product.title"
            :visible.sync="dialogVisible"
            width="95%"
            top="5vh">

            <div class="pageContainerMax">
                <product-details-display>
                    <!-- pics -->
                    <template slot="pics">
                        <product-image-carousel :product="dialogCartItem.product" />
                    </template>

                    <!-- description -->
                    <template slot="description">
                        <div class="pbl fs16">{{ dialogCartItem.product.description_long }}</div>
                    </template>

                    <!-- price -->
                    <template slot="price">
                        <div class="fs20">
                            <product-price :product="dialogCartItem.product"></product-price>
                        </div>
                    </template>

                    <!-- size -->
                    <template slot="size">
                        <div class="fwb">{{ $t('Size') }}:</div>
                        {{ $t(dialogCartItem.variants.size) }}
                    </template>

                    <!-- quantity -->
                    <template slot="quantity">
                        <div class="fwb">{{ $t('Quantity') }}:</div>
                        {{ dialogCartItem.qty }}
                    </template>
                </product-details-display>
            </div>

        </el-dialog>
    </div>
</template>
