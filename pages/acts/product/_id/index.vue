<script>
import product_mixin from '@/mixins/product_mixin'

export default{
    middleware: 'authenticated',

    layout: 'admin',

    components: {
        ProductDetailsJsonView: () => import('@/components/product/admin/ProductDetailsJsonView')
    },

    mixins: [
        product_mixin
    ],

    data() {
        return {
            product: {}
        }
    },

    methods: {
        goToEdit() {
            this.$router.push({
                name: 'acts-product-upsert-id',
                params: { id: this.product.id }
            });
        }
    },

    async created() {
        try {
            this.product = await this.getProductById(this.$route.params.id);

            if(!this.product) {
                throw new Error(this.$t('Product not found'));
            }
        }
        catch(e) {
            this.$errorMessage(
                e.message,
                { closeOthers: true }
            )
        }
    }
}
</script>


<template>
    <div class="pal">
        <div class="tar mbl">
            <el-button type="primary"
                        @click="goToEdit">EDIT PRODUCT</el-button>
        </div>

        <product-details-json-view :product="product"></product-details-json-view>
    </div>
</template>
