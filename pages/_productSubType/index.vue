<script>
import product_mixin from '@/mixins/product_mixin';

export default {
    layout: 'home',

    components: {
        HeroProductTypeNav: () => import('@/components/HeroProductTypeNav'),
        ProductCardListDisplay: () => import('@/components/product/ProductCardListDisplay')
    },

    mixins: [
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
        try {
            let subTypeData = {};

            if(params.productSubType) {
                const subTypes = store.state.product.subTypes;
                Object.keys(subTypes).forEach((id) => {
                    if(subTypes[id].slug === params.productSubType.trim()) {
                        subTypeData = subTypes[id];
                    }
                });
            }


            let searchConfig = {
                where: ['published', '=', true],
                // andWhere: [
                //     ['total_inventory_count', '>', 0]  // doesn't work because 'total_inventory_count' is a virtual attribute
                // ],
                orderBy: 'updated_at',
                orderDir: 'DESC'
            };

            if(subTypeData.value) {
                searchConfig.whereRaw = ['sub_type & ? > 0', [subTypeData.value]];
            }

            const products = await product_mixin.methods.getProducts.call(
                app,
                searchConfig
            );

            return {
                products: products,
                productSubType: subTypeData.name
            }
        }
        catch(err) {
            console.error("Error getting products", err)
        }
    },

    computed: {
        productTypeName() {
            return this.$t(this.productSubType);
        }
    },

    head() {
        return {
            title: this.productTypeName,
            meta: [
                { vmid: 'description', name: 'description', content: `${this.productTypeName} by ${this.$store.state.ui.brandName}` }
            ]
        }
    }
}
</script>


<template>
    <div>
        <hero-product-type-nav />

        <product-card-list-display
            :products="products"
            :type="productSubType" />
    </div>
</template>
