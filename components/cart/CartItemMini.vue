<script>
import product_mixin from '@/mixins/product_mixin';

export default {
    props: {
        cartItem: {
            type: Object,
            default: null
        }
    },

    components: {
        ProductPrice: () => import('@/components/product/ProductPrice')
    },

    mixins: [
        product_mixin
    ]
}
</script>


<template>
    <article class="cartItemMini">
        <!-- pic -->
        <div class="cartItemPic" :style="'background-image:url(' + featuredProductPic(cartItem.product) + ');'"></div>

        <div class="flexGrow pam fs14">
            <!-- title -->
            <div class="fwb mbs">{{ cartItem.product.title }}</div>

            <!-- Size -->
            <div class="mbs">
                {{ $t(cartItem.variants.size) }}
                <span v-if="cartItem.qty > 1" class="pls">({{ $t('quantity') }}: {{ cartItem.qty }})</span>
            </div>

            <!-- Price -->
            <div class="fwb">
                TODO
                <!-- <product-price
                    :product="cartItem.product"
                    :show-strikethrough="false" /> -->
            </div>
        </div>
    </article>
</template>

<style lang="scss">
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
</style>
