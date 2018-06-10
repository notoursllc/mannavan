<script>
import Vue from 'vue'
import { Notification, Button } from 'element-ui'
import ProductDetailsJsonView from '@/components/product/admin/ProductDetailsJsonView'
import product_mixin from '@/mixins/product_mixin'


let currentNotification = null;

Vue.prototype.$notify = Notification;
Vue.use(Button);


function showNotification(Notification) {
    if(currentNotification) {
        currentNotification.close();
    }
    currentNotification = Notification
}


export default{
    middleware: 'authenticated',

    layout: 'admin',

    components: {
        ProductDetailsJsonView
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
            showNotification(
                this.$notify({
                    type: 'error',
                    title: e.message,
                    duration: 0
                })
            );
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
