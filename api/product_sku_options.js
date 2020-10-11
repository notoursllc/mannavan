import queryString from 'query-string';

function formatParams(params) {
    return queryString.stringify(params, {arrayFormat: 'bracket'});
}


export default ($axios) => ({


    list(params) {
        return $axios.$get(`/product/sku/options?${formatParams(params)}`); // TODO: is there a XSS issue here?
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
