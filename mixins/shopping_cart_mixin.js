'use strict';

import isObject from 'lodash.isobject'


export default {
    methods: {
        getBraintreeClientToken() {
            return this.$axios
                .$get('/payment-token')
                .then((response) => {
                    return response.data;
                });
        },


        getCart() {
            return this.$axios
                .$get('/cart/get')
                .then((response) => {
                    return response.data;
                });
        },


        addItem(params) {
            return this.$axios
                .$post('/cart/item/add', params)
                .then((response) => {
                    return response.data;
                });
        },


        updateItemQty(params) {
            return this.$axios
                .$post('/cart/item/qty', params)
                .then((response) => {
                    return response.data;
                });
        },


        deleteItem(params) {
            return this.$axios
                .$post('/cart/item/remove', params)
                .then((response) => {
                    return response.data;
                });
        },


        setShippingAddress(address) {
            return this.$axios
                .$post('/cart/shipping/address', address)
                .then((response) => {
                    return response.data;
                });
        },


        validateAddress(address) {
            return this.$axios
                .$post('/shipping/validateAddress', address)
                .then((response) => {
                    return response.data;
                });
        },


        getShippingRates(params) {
            return this.$axios
                .$post('/shipping/rates', params)
                .then((response) => {
                    return response.data;
                });
        },


        setShippingRate(obj) {
            return this.$axios
                .$post('/cart/shipping/rate', {
                    shipping_rate: obj
                })
                .then((response) => {
                    return response.data;
                });
        },


        checkout(params) {
            return this.$axios
                .$post('/cart/checkout', params)
                .then((response) => {
                    return response.data;
                });
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
