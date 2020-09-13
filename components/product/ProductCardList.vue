<script>
import ProductCard from '@/components/product/ProductCard';

export default {
    name: 'ProductCardList',

    components: {
        ProductCard
    },

    props: {
        products: {
            type: Array,
            default: () => {
                return [];
            }
        }
    }
};
</script>


<template>
    <div class="flex-container" style="margin:0">
        <div class="flex-container-column"
             v-for="product in products"
             :key="product.id">
            <product-card :product="product" />
        </div>
    </div>
</template>


<style lang="scss" scoped>
@import '~assets/css/components/_variables.scss';
@import "~assets/css/components/_mixins.scss";

.flex-container {
    display: block;
}
.flex-container-column {
    @include flex(1 0 auto);
    width: 100%;
    padding-bottom: 20px;
}
@media #{$medium-and-up} {
    .flex-container {
        @include flexbox();
        @include flex-wrap(wrap);
        @include justify-content(space-between);
    }
    .flex-container-column {
        @include flex(none);
        width: 49%;
    }
}
@media #{$large-and-up} {
    .flex-container-column {
        width: 32.5%;
    }
}
</style>

