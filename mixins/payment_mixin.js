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


        async purchaseShippingLabel(data) {
            const response = await this.$axios.$post('/payment/shipping/label', data);
            return response.data;
        },


        async getShippingLabel(paymentId) {
            const response = await this.$axios.$get('/payment/shipping/label', {
                params: {
                    id: paymentId
                }
            });

            return response.data;
        },


        async deleteShippingLabelForPayment(paymentId) {
            const response = await this.$axios.$delete('/payment/shipping/label', {
                params: {
                    id: paymentId
                }
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
