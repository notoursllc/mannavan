<script>
import isObject from 'lodash.isobject';
import _forEach from 'lodash.foreach';
import product_mixin from '@/mixins/product_mixin';
import shopping_cart_mixin from '@/mixins/shopping_cart_mixin';

const globalTypes = process.env.GLOBAL_TYPES;

export default {
    components: {
        ProductDetails: () => import('@/components/product/details/ProductDetails')
    },

    data() {
        return {
            product: null
        }
    },

    mixins: [
        product_mixin,
    ],

    async asyncData({ params, store, app }) {
        try {
            const data = {};
            data.product = await product_mixin.methods.getProductBySeoUri.call(app, params.seouri);

            if(!data.product) {
                return;
            }

            let opts = product_mixin.methods.buildSizeOptions(data.product);
            data.sizeOptions = opts.sizeOpts;

            return data;
        }
        catch(err) {
            console.log("Error getting product", err)
        }
    },

    created() {
        if(!this.product) {
            this.$errorMessage(
                this.$t('Product not found'),
                { closeOthers: true }
            )
        }
    },

    head() {
        return {
            title: this.productTitle,
            meta: [
                { vmid: 'description', name: 'description', content: this.productDesc },
                { name: 'og:site_name', content: this.$store.state.ui.siteName },
                { name: 'og:url', content: this.$route.fullPath },
                { name: 'og:title', content: this.productTitle },
                { name: 'og:type', content: 'website' },
                { name: 'og:image', content: this.mediaPicture },
                { name: 'og:description', content: this.product ? this.product.description_long: '' },
            ]
        }
    }
}
</script>


<template>
    <div class="pageContainerMax">
        <template v-if="product">
            <product-details :product="product" />
        </template>
    </div>
</template>

