<script>
import HeroMain from '@/components/HeroMain';
import HeroProductTypeNav from '@/components/HeroProductTypeNav';
import ProductCardListDisplay from '@/components/product/ProductCardListDisplay';
import app_mixin from '@/mixins/app_mixin';
import product_mixin from '@/mixins/product_mixin';

export default {
    layout: 'home',

    components: {
        HeroMain,
        HeroProductTypeNav,
        ProductCardListDisplay
    },

    mixins: [
        app_mixin,
        product_mixin
    ],

    data() {
        return {
            products: [],
            productSubType: null
        }
    },

    async asyncData({ params, store, app }) {
        // console.log("IN ASYNC DATA store", store.state.product)
        // console.log("IN ASYNC DATA", context.app.store)
        // this.init(context.app.$route.params.id)
        try {
            let subTypeData = {};

            if(params.name) {
                subTypeData = product_mixin.methods.getIdByProductType(params.name);
            }

            let searchConfig = {
                where: ['is_available', '=', true],
                // andWhere: [
                //     ['total_inventory_count', '>', 0]  // doesn't work because 'total_inventory_count' is a virtual attribute
                // ],
                orderBy: 'updated_at',
                orderDir: 'DESC'
            };

            if(subTypeData.productTypeId) {
                searchConfig.whereRaw = ['sub_type & ? > 0', [subTypeData.productTypeId]];
            }

            const products = await product_mixin.methods.getProducts.call(
                app,
                searchConfig
            );

            return {
                products: products,
                productSubType: subTypeData.productSubType
            }
        }
        catch(err) {
            console.error("Error getting products", err)
        }
    },

    computed: {
        productTypeName() {
            return this.$tc(this.productSubType, 2);
        }
    },

    created() {
        // this.$store.dispatch('ui/pageTitle', this.productTypeName);
        this.$store.dispatch('ui/pageTitle', null); // hide the top bar
    },

    head() {
        return {
            title: this.productTypeName,
            meta: [
                { vmid: 'description', name: 'description', content: `${this.productTypeName} by ${this.getBrandName()}` }
            ]
        }
    }
}
</script>


<template>
    <div>
        <hero-main>
            <div class="home-copy-55">
                <h1 class="heading">Welcome to Breadvan</h1>
                <div class="sub-heading">
                    It's what drivers wear away from the track.
                </div>
            </div>
        </hero-main>

        <hero-product-type-nav />

        <product-card-list-display
            :products="products"
            :type="productSubType" />
    </div>
</template>
