<script>
import { mapGetters } from 'vuex';
import queryString from 'query-string';
import ProductCard from '@/components/product/ProductCard';
import product_mixin from '@/mixins/product_mixin';
import app_mixin from '@/mixins/app_mixin'



function getProductSearchConfig(productTypeId) {
    return {
        where: ['is_available', '=', true],
        whereRaw: ['sub_type & ? > 0', [productTypeId]],
        andWhere: [
            ['inventory_count', '>', 0]
        ],
        orderBy: 'updated_at',
        orderDir: 'DESC'
    }
}


export default {
    props: ['id'],

    components: {
        ProductCard
    },

    mixins: [
        product_mixin,
        app_mixin
    ],

    data() {
        return {
            products: {},
            productSubType: null
        }
    },

    async asyncData({ params, store, app }) {
        // console.log("IN ASYNC DATA store", store.state.product)
        // console.log("IN ASYNC DATA store", store.state.product)
        // console.log("IN ASYNC DATA", context.app.store)
        // this.init(context.app.$route.params.id)

        try {
            const subTypeData = product_mixin.methods.getIdByProductType(params.name);

            const products = await product_mixin.methods.getProducts.call(
                app,
                getProductSearchConfig(subTypeData.productTypeId)
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
    <div class="flex-container" style="margin:0">
        <div class="flex-container-column"
            style="padding:0"
            v-for="product in products"
            :key="product.id">
            <span v-on:click="goToProductDetails(product.seo_uri, $route.params.name)" class="cursorPointer">
                <product-card :product="product"></product-card>
            </span>
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
        @include flex(1);
        width: 100%;
    }
}

</style>
