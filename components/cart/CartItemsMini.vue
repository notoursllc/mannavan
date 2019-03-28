<script>
import Vue from 'vue'
import { mapGetters } from 'vuex'
import ProductPrice from '@/components/product/ProductPrice'
import product_mixin from '@/mixins/product_mixin'
import shopping_cart_mixin from '@/mixins/shopping_cart_mixin'

export default {
    props: {
        shoppingCart: {
            type: Object,
            default: null
        }
    },

    components: {
        ProductPrice
    },

    mixins: [
        product_mixin
    ]
}
</script>


<template>
    <div v-if="shoppingCart">
        <div v-if="!shoppingCart.num_items" class="fs16 tac pal">
            {{ $t('Your shopping cart does not contain any items.') }}
        </div>
        <div v-else class="ptl">
            <article
                v-for="item in shoppingCart.cart_items"
                :key="item.id"
                class="cartItemMini">

                <!-- pic -->
                <div
                    class="cartItemPic"
                    :style="'background-image:url(' + featuredProductPic(item.product) + ');'">
                </div>

                <div class="flexGrow pam fs14">
                    <!-- title -->
                    <div class="fwb mbs">{{ item.product.title }}</div>

                    <!-- Size -->
                    <div class="mbs">
                        {{ $t(item.variants.size) }}
                        <span v-if="item.qty > 1" class="pls">({{ $t('quantity') }}: {{ item.qty }})</span>
                    </div>

                    <!-- Price -->
                    <div class="fwb">
                        <product-price
                            :product="item.product"
                            :show-strikethrough="false" />
                    </div>
                </div>
            </article>
        </div>
    </div>
</template>

<style lang="scss">
    @import "~assets/css/components/_variables.scss";
    @import "~assets/css/components/_mixins.scss";

    .cartItemMini {
        width: 100%;
        margin-bottom: 10px;
        // background-color: #fff;
        background-color: rgba(255, 255, 255, 0.4);
        @include box-shadow(0px, 1px, 2px, rgba(0,0,0,.1));
        transition: background-color .5s linear;
        @include flexbox();
        @include flex-wrap(nowrap);
        @include flex-direction(row);
        @include align-content(stretch);

        .cartItemPic {
            width: 128px;
            min-height: 128px;
            background-size: cover;
            background-position: center;
        }
    }

    @media #{$medium-and-up} {

    }
</style>
