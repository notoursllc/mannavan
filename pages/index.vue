<script>
import product_mixin from '@/mixins/product_mixin';

let bgImages = [
    'bg_silver_car.jpg',
    'bg_black_5.jpg',
    // 'bg_green_yellow_6.jpg'
];

function randomIntFromInterval(min, max) {
    return Math.floor(Math.random()*(max-min+1)+min);
}


export default {
    layout: 'home',

    components: {
        HeroMain: () => import('@/components/HeroMain'),
        HeroProductTypeNav: () => import('@/components/HeroProductTypeNav'),
        ProductCardList: () => import('@/components/product/ProductCardList'),
        IconLogo: () => import('@/components/icons/IconLogo')
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
        const randomImage = `/images/backgrounds/${ bgImages[randomInt] }`;


        try {
            let searchConfig = {
                where: ['published', '=', true],
                // andWhere: [
                //     ['total_inventory_count', '>', 0]  // doesn't work because 'total_inventory_count' is a virtual attribute
                // ],
                orderBy: 'updated_at',
                orderDir: 'DESC'
            };

            const products = await app.$api.products.list(searchConfig);
            // console.log("PRODS", products)

            return {
                products: products.data,
                bgImage: randomImage
            }
        }
        catch(err) {
            console.error("Error getting products", err)
        }
    },

    head() {
        return {
            title: 'BreadVan',
            meta: [
                { vmid: 'description', name: 'description', content: `Apparel inspired by the good ol days of auto racing.` }
            ]
        }
    }
}
</script>


<template>
    <div>
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
        <hero-product-type-nav />
        <product-card-list :products="products" />
    </div>
</template>

<style lang="scss" scoped>
    @import "~assets/css/components/_mixins.scss";

    .home-content {
        background-position: center center;
        background-image: linear-gradient(rgba(0, 0, 0, 0.5),rgba(0, 0, 0, 0.5));
        background-size: cover;
        background-repeat: no-repeat;
        background-attachment: fixed;
        @include flex-basis(100%);
        width: 100%;
        margin: 0 auto;
        z-index: 2;
        @include flexbox();
        @include align-items(center);
        @include justify-content(flex-start);
        box-sizing: border-box;
        position: relative;
        padding: 50px 50px;
        // max-width: 70rem;
    }

    .home-image {
        opacity: 1;
        animation: image-loaded ease-in-out 1.5s forwards;
        height: auto;
        width: auto;
        padding: 0;
        flex-basis: 35%;
        width: 35%;
    }

    @keyframes image-loaded {
        0% {
            opacity:0
        }
        100% {
            opacity:1
        }
    }
</style>
