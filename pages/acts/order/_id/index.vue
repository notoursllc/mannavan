<script>
import Vue from 'vue'
import { Notification, Button } from 'element-ui'
import order_mixin from '@/mixins/order_mixin'
import FormRow from '@/components/FormRow'


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
        FormRow
    },

    mixins: [
        order_mixin
    ],

    data() {
        return {
            order: {}
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
            this.order = await this.getOrder(this.$route.params.id);

            if(!this.order) {
                throw new Error(this.$t('Order not found'));
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
        <!-- <div class="tar mbl">
            <el-button type="primary"
                        @click="goToEdit">EDIT PRODUCT</el-button>
        </div> -->

        <!-- general info -->
        <div class="g-spec">
            <div class="g-spec-label">General Info</div>
            <div class="g-spec-content">

                <!-- id -->
                <form-row label="ID:">{{ order.id }}</form-row>

                <!-- transaction id -->
                <form-row label="Transaction ID:">{{ order.transaction_id }}</form-row>

            </div>
        </div>

        <!-- JSON  -->
        <div class="g-spec">
            <div class="g-spec-label">JSON</div>
            <div class="g-spec-content">
                <pre style="overflow-x:scroll">{{ order | formatJson }}</pre>
            </div>
        </div>
    </div>
</template>
