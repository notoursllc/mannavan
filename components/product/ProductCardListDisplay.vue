<script>
import ProductCard from '@/components/product/ProductCard';
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
        ProductCard
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
                <nuxt-link
                    :to="{ name: 'seouri', params: { seouri: product.seo_uri } }"
                    tag="span">
                    <product-card :product="product"></product-card>
                </nuxt-link>
            </div>
        </div>
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

