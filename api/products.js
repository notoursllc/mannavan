import queryString from 'query-string';
import isObject from 'lodash.isobject';
import cloneDeep from 'lodash.clonedeep';


function stripRelations(data) {
    delete data.skus;
    delete data.images;
    delete data.created_at;
    delete data.updated_at;
    delete data.deleted_at;
    delete data.total_inventory_count;
}


export default ($axios) => ({

    // was getProducts
    async list(params) {
        let paramString = queryString.stringify(params, {arrayFormat: 'bracket'});

        // const response = await $axios.$get(`/products?${paramString}`); // TODO: is there a XSS issue here?
        const { data } = await $axios.$get(`/products?${paramString}`); // TODO: is there a XSS issue here?
        return data;
    },


    // TODO: remove
    async getProductInfo() {
        const { data } = await $axios.$get('/product/info');
        return data;
    },


    // was getProductBySeoUri
    async getBySeoUri(str) {
        const { data } = await $axios.$get('/product/seo', {
            params: {
                id: str
            }
        });
        return data;
    },


    // was getProductById
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


    async upsert(data) {
        let response;
        let prod = cloneDeep(data);

        stripRelations(prod);

        if(prod.id) {
            response = await $axios.$put('/product', prod);
        }
        else {
            response = await $axios.$post('/product', prod);
        }

        return response.data;
    },


    // was deleteProduct
    async delete(id) {
        const { data } = await $axios.$delete(`/product`, {
            params: {
                id
            }
        });
        return data;
    },


    async upsertImage(formData) {
        const { data } = await $axios.$post('/product/image', formData);
        return data;
    },


    async deleteImage(id) {
        const { data } = await $axios.$delete(`/product/image`, {
            params: {
                id
            }
        });
        return data;
    },


    //////////////////
    // SKUs
    //////////////////
    async upsertSku(data) {
        let response;
        let sku = cloneDeep(data);

        stripRelations(sku);

        if(sku.id) {
            response = await $axios.$put('/product/sku', sku);
        }
        else {
            response = await $axios.$post('/product/sku', sku);
        }

        return response.data;
    },


    async deleteSku(id) {
        const { data } = await $axios.$delete(`/product/sku`, {
            params: {
                id
            }
        });
        return data;
    },


    async upsertSkuImage(imgData) {
        const { data } = await $axios.$post('/product/sku/image', imgData);
        return data;
    },


    async deleteSkuImage(id) {
        const { data } = await $axios.$delete(`/product/sku/image`, {
            params: {
                id
            }
        });
        return data;
    },


    //////////////////
    // Collections
    //////////////////
    async listProductCollections() {
        const { data } = await $axios.$get('/collections');
        return data;
    },


    async getProductCollection(id) {
        const { data }  = await $axios.$get('/collection', {
            params: {
                id
            }
        });

        return data;
    },


    async upsertProductCollection(data) {
        let response;

        if(data.hasOwnProperty('id')) {
            response = await $axios.$put('/collection', data);
        }
        else {
            response = await $axios.$post('/collection', data);
        }

        return response.data;
    },


    async deleteProductCollection(id) {
        const { data } = await $axios.$delete('/collection', {
            params: {
                id
            }
        });

        return data;
    }

});
