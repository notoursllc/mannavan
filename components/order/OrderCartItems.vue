<script>
import ProductPrice from '@/components/product/ProductPrice'
import product_mixin from '@/mixins/product_mixin'

export default {
    props: {
        cartItems: {
            type: Array,
            required: true
        }
    },

    components: {
        ProductPrice
    },

    mixins: [
        product_mixin,
    ]
}
</script>

<template>
    <div>
        <article v-for="item in cartItems"
                :key="item.id"
                class="cartItem"
                :id="'cartItem' + item.id">
            <div class="cartItemPic">
                <figure class="image">
                    <img v-bind:src="featuredProductPic(item.product)">
                </figure>
            </div>

            <div class="cartItemInfo">
                <div class="cartItemInfoContent">
                    <div class="cartItemMain">
                        <a class="itemTitle" @click="goToProductDetails(item.product.seo_uri)">{{ item.product.title }}</a>
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
                        <div class="itemVal"><product-price :product="item.product" :show-strikethrough="false"></product-price></div>
                    </div>

                    <!-- Quantity -->
                    <div class="cartItemCol">
                        <label class="itemLabel">{{ $t('Quantity' )}}:</label>
                        <div>{{ item.qty }}</div>
                    </div>
                </div>
            </div>
        </article>
    </div>
</template>
