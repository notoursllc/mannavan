<script>
const bgImages = [
    'bg_silver_car.jpg',
    'bg_black_5.jpg'
    // 'bg_green_yellow_6.jpg'
];

function randomIntFromInterval(min, max) {
    return Math.floor(Math.random()*(max-min+1)+min);
}


export default {
    layout: 'home',

    components: {
        HeroMain: () => import('@/components/HeroMain'),
        ProductCardList: () => import('@/components/product/ProductCardList')
    },

    data() {
        return {
            products: {},
            bgImage: null
        };
    },

    async asyncData({ params, store, app }) {
        // console.log("IN ASYNC DATA store", store.state.product)
        // console.log("IN ASYNC DATA", context.app.store)
        const randomInt = randomIntFromInterval(0, (bgImages.length - 1));
        const randomImage = `/images/backgrounds/${bgImages[randomInt]}`;

        try {
            const products = await app.$api.products.list({
                where: ['published', '=', true],
                // andWhere: [
                //     ['total_inventory_count', '>', 0]  // doesn't work because 'total_inventory_count' is a virtual attribute
                // ],
                orderBy: 'updated_at',
                orderDir: 'DESC'
            });
            // console.log("PRODS", products)

            return {
                products: products.data,
                bgImage: randomImage
            };
        }
        catch(err) {
            console.error('Error getting products', err);
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
    <div>
        <div class="hero-wrap">
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

        <div class="card-list-wrap content-wrap">
            <product-card-list :products="products" />
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import "~assets/css/components/_mixins.scss";

.hero-wrap,
.card-list-wrap {
    padding-top: 20px;
}
</style>
