<script>
import Vue from 'vue'
import product_mixin from '@/mixins/product_mixin';
import HeroMain from '@/components/HeroMain'
import HeroProductTypeNav from '@/components/HeroProductTypeNav'
import ProductCardListDisplay from '@/components/product/ProductCardListDisplay'
import IconLogo from '@/components/icons/IconLogo';

console.log("GLOBAL_TYPES", process.env.GLOBAL_TYPES)

let bgImages = [
    'bg_silver_car.jpg',
    'bg_black_5.jpg',
    'bg_yellow_mclaren.jpg',
    'bg_green_yellow_6.jpg',
    // 'bg_seven_eleven.jpg'
];

function randomIntFromInterval(min, max) {
    return Math.floor(Math.random()*(max-min+1)+min);
}

const randomInt = randomIntFromInterval(0, (bgImages.length - 1));
const randomImage = `/images/backgrounds/${ bgImages[randomInt] }`;

export default {
    layout: 'home',

    components: {
        HeroMain,
        HeroProductTypeNav,
        ProductCardListDisplay,
        IconLogo
    },

    data() {
        return {
            products: {},
            bgImage: null
        }
    },

    async asyncData({ params, store, app }) {
        // console.log("IN ASYNC DATA store", store.state.product)
        // console.log("IN ASYNC DATA", context.app.store)
        // this.init(context.app.$route.params.id)

        const randomInt = randomIntFromInterval(0, (bgImages.length - 1));
        const randomImage = `/images/backgrounds/${ bgImages[randomInt] }`;

        try {
            let searchConfig = {
                where: ['is_available', '=', true],
                // andWhere: [
                //     ['total_inventory_count', '>', 0]  // doesn't work because 'total_inventory_count' is a virtual attribute
                // ],
                orderBy: 'updated_at',
                orderDir: 'DESC'
            };

            const products = await product_mixin.methods.getProducts.call(
                app,
                searchConfig
            );

            return {
                products: products,
                bgImage: randomImage
            }
        }
        catch(err) {
            console.error("Error getting products", err)
        }
    },

    created() {
        this.$store.dispatch('ui/pageTitle', null);
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
            <div class="heading-icon">
                <icon-logo icon-name="logo" class="vam" width="125px" />
            </div>
            <div class="heading-text">
                <h1 class="heading">This is what drivers wear<br/>off the track</h1>
                <!-- <div class="sub-heading">
                    This is what drivers wear off the track.
                </div> -->
            </div>
        </hero-main>
        <hero-product-type-nav />
        <product-card-list-display
            :products="products" />
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
