'use strict';

import queryString from 'query-string';

export default {
    computed: {
        cardType: function() {
            if(this.order.transaction.payment.type === 'paypal_account') {
                return 'paypal';
            }

            return this.order.transaction.payment.cardType;
        }
    },

    methods: {
        async getOrderTransaction(transaction_id, verbose) {
            const response = await this.$axios.$get('/order/transaction', {
                params: {
                    transaction_id,
                    verbose
                }
            });
            return response.data;
        },

        async getOrder(id) {
            const response = await this.$axios.$get('/order', {
                params: { id }
            });
            return response.data;
        },

        async getOrders(params) {
            let paramString = queryString.stringify(params, {arrayFormat: 'bracket'});

            const response = await this.$axios.$get(`/orders?${paramString}`); // TODO: is there a XSS issue here?
            return response.data;
        },

        goToOrderDetails: function(transactionId) {
            return this.$router.push({
                name: 'order-details-id',
                params: { id: transactionId }
            });
        }
    }
}
