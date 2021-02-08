<script>
import ProductCard from '@/components/product/ProductCard';

import {
    FigCol,
    FigRow
} from '@notoursllc/figleaf';

export default {
    name: 'ProductCardList',

    components: {
        ProductCard,
        FigCol,
        FigRow
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
    <fig-row md="1/2" lg="1/3" default="full" default-gap="1" sm-gap="2">
        <fig-col
            v-for="(product, idx) in products"
            :key="idx">
            <product-card
                :product="product" />
        </fig-col>
    </fig-row>
</template>

