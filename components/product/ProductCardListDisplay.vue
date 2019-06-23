<script>
import ProductCard from '@/components/product/ProductCard';

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

    components: {
        ProductCard
    }
}
</script>


<template>
    <div>
        <div class="flex-container" style="margin:0">
            <div class="flex-container-column"
                style="padding:0"
                v-for="product in products"
                :key="product.id">
                <nuxt-link
                    :to="{ name: 'type-name-seouri', params: { name: type, seouri: product.seo_uri } }"
                    tag="span"
                    class="card-wrapper">
                    <product-card :product="product"></product-card>
                </nuxt-link>
            </div>
        </div>
    </div>
</template>


<style lang="scss" scoped>
@import '~assets/css/components/_variables.scss';
@import "~assets/css/components/_mixins.scss";

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



.card-wrapper {
    cursor: pointer;

    .pic-card {
        margin: .5px;
        @include grow();
    }
    .pic-card:hover {
        @include growHover(1.01)
    }
}

@media #{$medium-and-down} {
    .flex-container-column {
        width: 50%;
    }
}
@media #{$small-and-down} {
    .flex-container {
        display: block;
    }
    .flex-container-column {
        @include flex(1 0 auto);
        width: 100%;
    }
}

</style>

