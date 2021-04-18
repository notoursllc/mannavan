export default ($axios) => ({

    async get(id) {
        const { data } = await $axios.$get('/cart', {
            params: { id }
        });
        return data;
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
    }

});
