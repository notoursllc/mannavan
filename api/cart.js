export default ($axios) => ({

    async get(params) {
        const { data } = await $axios.$get('/cart', {
            params: {
                ...params
            }
        });
        return data;
    },


    update(params) {
        return $axios.$post('/cart/upsert', {
            ...params
        });
    },


    setShippingAddress(params) {
        return $axios.$post('/cart/shippingaddress', {
            ...params
        });
    },


    addItem(params) {
        return $axios.$post('/cart/item', {
            ...params
        });
    },


    updateItem(params) {
        return $axios.$put('/cart/item', {
            ...params
        });
    },


    deleteItem(params) {
        return $axios.$delete('/cart/item', {
            params: {
                ...params
            }
        });
    },

    shipping: {
        getEstimatesForCart(cartId) {
            return $axios.$post('/cart/shipping/estimate', {
                id: cartId
            });
        },

        selectRate(cartId, rateId) {
            return $axios.$post('/cart/shipping/rate', {
                id: cartId,
                rate_id: rateId
            });
        }
    },

    payment: {
        intent(cartId) {
            return $axios.$post('/cart/payment/intent', {
                id: cartId
            });
        },

        success(cartId, paymentIntentId) {
            return $axios.$post('/cart/payment', {
                id: cartId,
                stripe_payment_intent_id: paymentIntentId
            });
        },

        async getPayment(cartId) {
            const { data } = await $axios.$get('/cart/payment', {
                params: {
                    id: cartId
                }
            });
            return data;
        },


        paypal: {
            async create(cartId) {
                const { data } = await $axios.$post('/cart/payment/paypal', {
                    id: cartId
                });
                return data;
            },

            execute(cartId, paymentToken) {
                return $axios.$put('/cart/payment/paypal', {
                    id: cartId,
                    token: paymentToken
                });
            }
        }
    }

});
