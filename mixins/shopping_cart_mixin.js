'use strict';

import isObject from 'lodash.isobject'


export default {
    methods: {
        async getBraintreeClientToken() {
            const response = await this.$axios.$get('/payment-token');
            return response.data;
        },


        async getCartToken() {
            // Note: not using the shorthand $get method here
            // because we need the headers property on the response
            const response = await this.$axios.get('/jwt');
            return response.headers.authorization;
        },


        async getCart() {
            const response = await this.$axios.$get('/cart/get');
            return response.data;
        },


        async addItem(params) {
            const response = await this.$axios.$post('/cart/item/add', params);
            return response.data;
        },


        async updateItemQty(params) {
            const response = await this.$axios.$post('/cart/item/qty', params);
            return response.data;
        },


        async deleteItem(params) {
            const response = await this.$axios.$post('/cart/item/remove', params);
            return response.data;
        },


        async setShippingAddress(address) {
            const response = await this.$axios.$post('/cart/shipping/address', address);
            return response.data;
        },


        async validateAddress(address) {
            const response = await this.$axios.$post('/shipping/validateAddress', address);
            return response.data;
        },


        async getShippingRates(params) {
            const response = await this.$axios.$post('/shipping/rates', params);
            return response.data;
        },


        async setShippingRate(obj) {
            const response = await this.$axios.$post('/cart/shipping/rate', {
                shipping_rate: obj
            });
            return response.data;
        },


        async checkout(params) {
            const response = await this.$axios.$post('/cart/checkout', params);
            return response.data;
        },


        getPaymentMonthYearClass(monthClasses, yearClasses) {
            if(Array.isArray(monthClasses) && Array.isArray(yearClasses)) {
                if(monthClasses[1] === yearClasses[1]) {
                    return monthClasses;
                }
                // find which set has the error classes and return those;
                else if(monthClasses[1] === 'icon-times-circle') {
                    return monthClasses;
                }
                else {
                    return yearClasses;
                }
            }
        },


        getFormattedShippingName(firstName, lastName) {
            let val = [];

            if(firstName) {
                val.push(firstName);
            }

            if(lastName) {
                val.push(lastName);
            }

            return val.join(' ');
        },


        getFormattedCityStateZip(city, state, postalCode) {
            let val = [];

            if(city) {
                val.push(city)
            }

            if(state || postalCode) {
                val.push(',');

                if(state) {
                    val.push(' ' + state);
                }

                if(postalCode) {
                    val.push(' ' + postalCode);
                }
            }

            return val.join('');
        },


        getFormattedCompanyName(name) {
            if(name) {
                return name.toUpperCase()
            }
            return null;
        }
    }
}
