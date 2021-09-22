<script>
import product_mixin from '@/mixins/product_mixin';
import ProductCard from '@/components/product/ProductCard';
import {
    FigProductGrid,
    FigContent
} from '@notoursllc/figleaf';

export default {
    components: {
        ProductCard,
        FigProductGrid,
        FigContent
    },

    mixins: [
        product_mixin
    ],

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

            const searchConfig = {
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

            const { data } = await app.$api.products.list(searchConfig);

            return {
                products: data,
                productSubType: subTypeData.name
            };
        }
        catch(err) {
            console.error('Error getting products', err);
        }
    },

    data() {
        return {
            products: [],
            productSubType: null
        };
    },

    head() {
        return {
            title: this.productTypeName,
            meta: [
                { vmid: 'description', name: 'description', content: `${this.productTypeName} by ${this.$store.state.ui.brandName}` }
            ]
        };
    },

    computed: {
        productTypeName() {
            return this.$t(this.productSubType);
        }
    }
};
</script>


<template>
    <fig-content>
        <fig-product-grid :products="products">
            <template v-slot:default="slotProps">
                <product-card :product="slotProps.data.product" />
            </template>
        </fig-product-grid>
    </fig-content>
</template>
