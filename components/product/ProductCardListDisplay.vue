<script>
import product_mixin from '@/mixins/product_mixin';

export default {
    name: 'ProductCardListDisplay',

    props: {
        products: {
            type: Array
        },

        type: {
            type: String
        }
    },

    mixins: [
        product_mixin
    ],

    components: {
        ProductCard: () => import('@/components/product/ProductCard'),
        ProductDetails: () => import('@/components/product/details/ProductDetails'),
    },

    data: function() {
        return {
            productDialog: {
                visible: false,
                product: null
            }
        }
    },

    methods: {
        async showProduct(seouri) {
            this.productDialog.product = await this.getProductBySeoUri(seouri);

            if(!this.productDialog.product) {
                this.$errorMessage(
                    this.$t('Product not found'),
                    { closeOthers: true }
                );
                return;
            }

            this.productDialog.visible = true;
        },

        onProductAddedToCart(product) {
            this.productDialog.visible = false;
            this.$nuxt.$emit('PRODUCT_ADDED_TO_CART', product);

            // this.$router.push({
            //     name: 'cart-id',
            //     params: { id: product.id }
            // });
            // this.productDialog.visible = false;

            // this.$router.push({
            //     name: 'cart-id',
            //     params: { id: product.id }
            // });
        }
    }
}
</script>


<template>
    <div class="prod-card-container">
        <div class="flex-container" style="margin:0">
            <div class="flex-container-column"
                style="padding:0"
                v-for="product in products"
                :key="product.id">
                <span @click="showProduct(product.seo_uri)">
                    <product-card :product="product" />
                </span>
            </div>
        </div>

        <!-- product dialog -->
        <el-dialog
            title=""
            :visible.sync="productDialog.visible"
            :append-to-body="true"
            :key="new Date().getTime()"
            top="5vh"
            width="95%">
            <product-details
                :product="productDialog.product"
                @addedToCart="onProductAddedToCart" />
        </el-dialog>
    </div>
</template>


<style lang="scss" scoped>
@import '~assets/css/components/_variables.scss';
@import "~assets/css/components/_mixins.scss";

.prod-card-container {
    background-color: #f4f4f4;
    padding: 30px;
}

.flex-container {
    @include flexbox();
    @include flex-wrap(wrap);
}
.is-third {
    @include flex(none);
    width: 33.33333%;
}
.flex-container-column {
    @include flex(none);
    width: 33.33333%;
}

.pic-card {
    margin: 2px;
    @include grow();
}
.pic-card:hover {
    cursor: pointer;
    @include growHover(1.01)
}

@media #{$medium-and-down} {
    .prod-card-container {
        padding: 20px;
    }

    .flex-container-column {
        width: 50%;
    }
}
@media #{$small-and-down} {
    .prod-card-container {
        padding: 5px;
    }

    .flex-container {
        display: block;
    }
    .flex-container-column {
        @include flex(1 0 auto);
        width: 100%;
    }
}

</style>

