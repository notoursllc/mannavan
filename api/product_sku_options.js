import queryString from 'query-string';


export default ($axios) => ({


    list(params) {
        const paramString = queryString.stringify(params, {arrayFormat: 'bracket'});
        return $axios.$get(`/product/sku/options?${paramString}`); // TODO: is there a XSS issue here?
    },


    async get(id) {
        const { data } = await $axios.$get('/product/sku/option', {
            params: {
                id
            }
        });
        return data;
    }

});
