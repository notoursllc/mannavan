<script>
import HeroMain from '@/components/HeroMain';
import ProductCard from '@/components/product/ProductCard';
import {
    FigProductGrid,
    FigContent
} from '@notoursllc/figleaf';

const bgImages = [
    'bg_silver_car.jpg',
    'bg_black_5.jpg'
    // 'bg_green_yellow_6.jpg'
];

function randomIntFromInterval(min, max) {
    return Math.floor(Math.random()*(max-min+1)+min);
}


export default {
    components: {
        HeroMain,
        ProductCard,
        FigProductGrid,
        FigContent
    },

    async asyncData({ params, store, app }) {
        // console.log("IN ASYNC DATA store", store.state.product)
        // console.log("IN ASYNC DATA", context.app.store)
        const randomInt = randomIntFromInterval(0, (bgImages.length - 1));
        const randomImage = `/images/backgrounds/${bgImages[randomInt]}`;

        try {
            const { data } = await app.$api.product.list({
                where: ['published', '=', true],
                // andWhere: [
                //     ['total_inventory_count', '>', 0]  // doesn't work because 'total_inventory_count' is a virtual attribute
                // ],
                orderBy: 'updated_at',
                orderDir: 'DESC'
            });

            return {
                products: data,
                bgImage: randomImage
            };
        }
        catch(err) {
            console.error('Error getting products', err);
        }
    },

    data() {
        return {
            products: {},
            bgImage: null
        };
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
    <fig-content full-height class="pt-2">
        <div class="pb-3">
            <hero-main :bg-image="bgImage">
                <!-- <div class="heading-icon">
                    <icon-logo icon-name="logo" class="vam" width="125px" />
                </div> -->
                <div class="heading-text">
                    <h1 class="heading"><mark>Everyday is race day.<br/>Dress like it.</mark></h1>
                    <!-- <div class="sub-heading">
                        This is what drivers wear off the track.
                    </div> -->
                </div>
            </hero-main>
        </div>

        <fig-product-grid :products="products">
            <template v-slot:default="slotProps">
                <product-card
                    class
                    :product="slotProps.data.product"
                    :image-loading="slotProps.data.index > 5 ? 'lazy' : 'eager'" />
            </template>
        </fig-product-grid>
    </fig-content>
</template>


<style scoped>
.hero-wrap,
.card-list-wrap {
    padding-top: 20px;
}
</style>
