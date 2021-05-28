export default ($axios) => ({

    async get(id) {
        const { data } = await $axios.$get('/cart', {
            params: { id }
        });
        return data;
    },


    update(params) {
        return $axios.$post('/cart/upsert', {
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


    deleteItem(id) {
        return $axios.$delete('/cart/item', {
            params: { id }
        });
    },

    shipping: {
        estimate(cartId) {
            return $axios.$post('/cart/shipping/estimate', {
                id: cartId
            });
        },

        selectRate(cartId, rateId) {
            return $axios.post('/cart/shipping/rate', {
                id: cartId,
                rate_id: rateId
            });
        }
    }

});
