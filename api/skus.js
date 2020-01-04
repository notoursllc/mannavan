import queryString from 'query-string';
import isObject from 'lodash.isobject';

export default ($axios) => ({

    // async list(params) {
    //     let paramString = queryString.stringify(params, {arrayFormat: 'bracket'});

    //     // const response = await this.$axios.$get(`/products?${paramString}`); // TODO: is there a XSS issue here?
    //     const { data } = await $axios.$get(`/products?${paramString}`); // TODO: is there a XSS issue here?
    //     return data;
    // },


    // was getProductById
    // async get(id, options) {
    //     let params = {};

    //     if(isObject(options)) {
    //         params = {
    //             ...options
    //         };
    //     }

    //     params.id = id;

    //     const { data } = await $axios.$get('/product', {
    //         params
    //     });
    //     return data;
    // },


    async upsert(sku) {
        let response;

        delete sku.tmp;

        if(sku.id) {
            response = await $axios.$put('/sku', sku);
        }
        else {
            response = await $axios.$post('/sku', sku);
        }

        return response.data;
    },


    async delete(id) {
        const { data } = await $axios.$delete(`/sku`, {
            params: {
                id
            }
        });
        return data;
    },


    async uploadImages(sku) {

    }

});
