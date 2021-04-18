import queryString from 'query-string';
import isObject from 'lodash.isobject';


export default ($axios) => ({

    list(params) {
        const paramString = queryString.stringify(params, {arrayFormat: 'bracket'});
        return $axios.$get(`/products?${paramString}`); // TODO: is there a XSS issue here?
    },

    async get(id, options) {
        const { data } = await $axios.$get('/product', {
            params: {
                id,
                ...(isObject(options) ? options : {})
            }
        });
        return data;
    },

    /*
     * Product variants
     */
    async getVariant(id, options) {
        const response = await $axios.$get('/product/variant', {
            params: {
                id,
                ...(isObject(options) ? options : {})
            }
        });

        return response.data;
    },

    async getVariantSku(id) {
        const response = await $axios.$get('/product/variant/sku', {
            params: {
                id
            }
        });

        return response.data;
    }
});
