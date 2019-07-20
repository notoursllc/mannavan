<script>
import app_mixin from '@/mixins/app_mixin'
import payment_mixin from '@/mixins/payment_mixin'


export default {
    components: {
        OrderDetails: () => import('@/components/order/OrderDetails')
    },

    mixins: [
        app_mixin,
        payment_mixin
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
            this.order = await this.getPayment(this.$route.params.id);
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
    <div class="pageContainerMax" v-loading.fullscreen.lock="loading">

        <template v-if="!loading">
            <div v-if="!orderExists" class="tac">
                {{ $t('Oops we could not find the order you are looking for.') }}
            </div>
            <div v-else>
                <order-details :order="order" />
            </div>
        </template>

    </div>
</template>
