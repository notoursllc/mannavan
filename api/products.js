import queryString from 'query-string';
import isObject from 'lodash.isobject';


export default ($axios) => ({

    list(params) {
        const paramString = queryString.stringify(params, {arrayFormat: 'bracket'});
        return $axios.$get(`/products?${paramString}`); // TODO: is there a XSS issue here?
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
    },


    /*
     * Product variants
     */

    async getVariantSku(id) {
        const response = await $axios.$get('/product/variant/sku', {
            params: {
                id
            }
        });

        return response.data;
    }


});
