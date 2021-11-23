<script>
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
                published: true,
                _sort: 'updated_at:desc',
                _withRelated: '*'
            };

            if(subTypeData.value) {
            //     // searchConfig.whereRaw = ['sub_type & ? > 0', [subTypeData.value]];
                searchConfig.sub_type = { bitwise_and_gt: { left: subTypeData.value, right: 0 } };
            }

            const { data } = await app.$api.product.list(searchConfig);

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
