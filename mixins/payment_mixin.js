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
        async getBraintreeClientToken() {
           const response = await this.$axios.$get('/payment/token');
           return response.data;
        },


        async getPayment(id) {
            const response = await this.$axios.$get('/payment', {
                params: { id }
            });
            return response.data;
        },


        async getPaymentSummary(id) {
            const response = await this.$axios.$get('/payment/summary', {
                params: {
                    id
                }
            });
            return response.data;
        },


        async getPayments(params) {
            let paramString = queryString.stringify(params, {arrayFormat: 'bracket'});

            const response = await this.$axios.$get(`/payments?${paramString}`); // TODO: is there a XSS issue here?
            return response.data;
        },

        async createPackingSlipFromPayment(paymentId) {
            const response = await this.$axios.$post('/payment/shipping/packingslip', {
                id: paymentId
            });
            return response.data;
        },

        async purchaseShippingLabelFromPayment(paymentId) {
            const response = await this.$axios.$post('/payment/shipping/shippinglabel', {
                id: paymentId
            });
            return response.data;
        },


        goToPaymentDetails: function(transactionId) {
            return this.$router.push({
                name: 'order-details-id',
                params: { id: transactionId }
            });
        }
    }
}
