<script>
import ProductSlider from '@/components/home/productSlider/ProductSlider.vue';
import ProductSubtypeDataProvider from '@/components/product/ProductSubtypeDataProvider.js';

import {
    FigProductGrid,
    FigContent,
    FigOverlay,
    FigSlider,
    FigHeroSlider
} from '@notoursllc/figleaf';


export default {
    components: {
        FigProductGrid,
        FigContent,
        FigSlider,
        FigOverlay,
        FigHeroSlider,
        ProductSubtypeDataProvider,
        ProductSlider
    },

    data() {
        return {
            products: {},
            bgImage: null,
            productSubTypes: [],
            heros: []
        };
    },

    async asyncData({ params, store, app }) {
        try {
            const { data } = await app.$api.hero.list({
                published: true,
                _sort: 'ordinal:asc',
            });

            return {
                heros: data
            };
        }
        catch(err) {
            console.error('Error getting products', err);
        }
    },

    created() {
        const subTypes = this.$store.state.product.subTypes;

        for(const label in subTypes) {
            const type = subTypes[label];

            if(type.value && type.published) {
                this.productSubTypes.push({
                    label: this.$t(label),
                    value: type.value
                });
            }
        }
    },

    head() {
        return {
            title: 'BreadVan',
            meta: [
                { vmid: 'description', name: 'description', content: 'Apparel inspired by auto racing\'s glory days.' }
            ]
        };
    }
};
</script>


<template>
    <div class="h-full">
        <div class="Home">
            <div class="Home__main-slider">
                <fig-hero-slider :heros="heros" :options="{ infinite: false }" />
            </div>

            <div class="px-4">
                <product-subtype-data-provider
                    v-for="(obj, idx) in productSubTypes"
                    :key="idx"
                    :subtype="obj.value">
                    <template v-slot:default="{ products, loading }">
                        <product-slider
                            :loading="loading"
                            :products="products">
                            <template v-slot:title>{{ obj.label }}</template>
                        </product-slider>
                    </template>
                </product-subtype-data-provider>
            </div>
        </div>
    </div>
</template>


<style scoped>
.hero-wrap,
.card-list-wrap {
    padding-top: 20px;
}

.Home__main-slider {
    height: 100vh;
}

@screen sm {
    .Home__main-slider {
        height: 80vh;
    }
}
</style>
