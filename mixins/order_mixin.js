'use strict';

import queryString from 'query-string';
import shopping_cart_mixin from '@/mixins/shopping_cart_mixin';

export default {
    data: function() {
        return {
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

    computed: {
        formattedName() {
            if(this.order.shipping) {
                return shopping_cart_mixin.methods.getFormattedShippingName(this.order.shipping.firstName, this.order.shipping.lastName);
            }
        },

        formattedCityStateZip: function() {
            if(this.order.shipping) {
                return shopping_cart_mixin.methods.getFormattedCityStateZip(
                    this.order.shipping.locality,
                    this.order.shipping.region,
                    this.order.shipping.postalCode
                );
            }
        },

        companyDisplay: function() {
            if(this.order.shipping) {
                return shopping_cart_mixin.methods.getFormattedCompanyName(this.order.shipping.company);
            }
        },

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
                name: 'order-id',
                params: { id: transactionId }
            });
        }
    }
}
