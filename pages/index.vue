<script>
import ProductSlider from '@/components/home/productSlider/ProductSlider.vue';
import ProductSubtypeDataProvider from '@/components/product/ProductSubtypeDataProvider.js';
import {
    FigHero
} from '@notoursllc/figleaf';


export default {
    components: {
        FigHero,
        ProductSubtypeDataProvider,
        ProductSlider
    },

    data() {
        return {
            productSubTypes: [],
            heros: []
        };
    },

    computed: {
        heroImageUrl() {
            return this.heros[0]?.url
                ? `${this.heros[0].url}`
                : '';
        },

        heroTitle() {
            return this.heros[0]?.title
        },

        heroCaption() {
            return this.heros[0]?.caption
        },

        heroAltText() {
            return this.heros[0]?.alt_text
        }
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
            console.error('Error getting hero images', err);
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
        <fig-hero
            v-if="heroImageUrl"
            :url="heroImageUrl"
            image-sizes="lg:1280px md:550px sm:375px"
            :alt-text="heroAltText">
            <div class="w-full h-full p-4 md:pl-20 lg:pl-40 flex items-center">
                <div>
                    <h1
                        v-if="heroTitle"
                        class="bg-black bg-opacity-50 p-2 mb-4 text-3xl sm:text-4xl inline-block text-amber-500 m-0 font-extrabold">{{ heroTitle }}</h1>
                    <div
                        v-if="heroCaption"
                        class="bg-black bg-opacity-50 p-2 w-full md:w-1/2 lg:w-2/5 xl:1/3 text-lg sm:text-xl text-white font-extrabold">{{ heroCaption }}</div>
                </div>
            </div>
        </fig-hero>

        <div class="px-4 border-t border-gray-300">
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
</template>
