export default ($axios) => ({

    async get(id) {
        const { data } = await $axios.$get('/cart', {
            params: { id }
        });
        return data;
    },

    item(params) {
        return $axios.$post('/cart/item', {
            ...params
        });
    }

});
