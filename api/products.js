import queryString from 'query-string';
import isObject from 'lodash.isobject';


export default ($axios) => ({

    list(params) {
        const paramString = queryString.stringify(params, {arrayFormat: 'bracket'});
        return $axios.$get(`/products?${paramString}`); // TODO: is there a XSS issue here?
    },


    async getBySeoUri(str) {
        const { data } = await $axios.$get('/product/seo', {
            params: {
                id: str
            }
        });
        return data;
    },


    async get(id, options) {
        let params = {};

        if(isObject(options)) {
            params = {
                ...options
            };
        }

        params.id = id;

        const { data } = await $axios.$get('/product', {
            params
        });
        return data;
    }

});
