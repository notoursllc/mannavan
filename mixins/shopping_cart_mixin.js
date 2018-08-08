'use strict';

import isObject from 'lodash.isobject'


export default {
    methods: {
        setCartAndTokenStateFromResponse(response) {
            this.$store.dispatch('shoppingcart/CART_SET', response.data.data);
            this.$store.dispatch('shoppingcart/CART_TOKEN_SET', response.headers['x-cart-token']);
            return response.data.data;
        },

        async getBraintreeClientToken() {
             // note: using $get instead of get
            const response = await this.$axios.$get('/payment-token');
            return response.data;
        },


        async getCart() {
            return await this.$axios.get('/cart/get');
        },


        async addItem(params) {
            return await this.$axios.post('/cart/item/add', params);
        },


        async updateItemQty(params) {
            return await this.$axios.post('/cart/item/qty', params);
        },


        async deleteItem(params) {
            return await this.$axios.post('/cart/item/remove', params);
        },


        async setShippingAddress(address) {
            return await this.$axios.post('/cart/shipping/address', address);
        },


        async validateAddress(address) {
            // note: using $post instead of post
            const response = await this.$axios.$post('/shipping/validateAddress', address);
            return response.data;
        },


        async getShippingRates(params) {
            // const response = await this.$axios.post('/shipping/rates', params);
            const response = await this.$axios.get('/cart/shipping/rates');
            return response.data.data;
        },


        async setShippingRate(obj) {
            return await this.$axios.post('/cart/shipping/rate', {
                shipping_rate: obj
            });
        },


        async checkout(params) {
            const response = await this.$axios.post('/cart/checkout', params);

            // note: cart/checkout only returns an object containing a transaction id,
            // so no need to update the shopping cart or token state
            return response.data.data;
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
        },


        cartEmptyRedirect(shoppingCart) {
            if(shoppingCart && !shoppingCart.num_items) {
                this.$router.push({ name: 'cart-empty' });
                return true;
            }
            return false;
        },

        invalidShippingFormRedirect() {
            if(!this.$store.state.shoppingcart.shippingAddressIsValid) {
                this.$router.push({ name: 'cart-checkout' });
                return true;
            }

            return false;
        }
    }
}
