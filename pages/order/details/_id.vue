<script>
import Vue from 'vue'
import { Loading } from 'element-ui'
import OrderDetails from '@/components/order/OrderDetails'
import app_mixin from '@/mixins/app_mixin'
import order_mixin from '@/mixins/order_mixin'

Vue.use(Loading.directive)

export default {
    components: {
        OrderDetails
    },

    mixins: [
        app_mixin,
        order_mixin
    ],

    data: function() {
        return {
            loading: true,
            orderExists: false,
            order: {
                shipping: {},
                shoppingCart: {},
                transaction: {
                    payment: {}
                }
            }
        }
    },

    async created() {
        try {
            this.$store.dispatch('ui/pageTitle', this.$t('Order Details'));
            this.order = await this.getOrderTransaction(this.$route.params.id, true)
            this.orderExists = true;
            this.loading = false;
        }
        catch(e) {
            this.orderExists = false;
            this.loading = false;
        }
    },

    head() {
        return {
            title: this.$t('Order Details'),
            meta: [
                { vmid: 'description', name: 'description', content: `Order Details for your order from ${this.getSiteName()}` }
            ]
        }
    }
}
</script>

<template>
    <div class="pageContainerMax" v-loading="loading">

        <div v-if="!orderExists" class="tac">
            {{ $t('Oops we could not find the order you are looking for.') }}
        </div>
        <div v-else>
            <order-details :order="order" />
        </div>

    </div>
</template>
