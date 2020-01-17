import queryString from 'query-string';
import isObject from 'lodash.isobject';


function stripRelations(FormData) {
    // delete productJson.artist;
    // delete productJson.sizes;
    // delete productJson.pics;
    // delete productJson.tax;
    // delete productJson.variations;
    // delete productJson.package_type;
    // delete productJson.skus;

    // also strip uneditable values:
    FormData.delete('created_at');
    FormData.delete('updated_at');
    FormData.delete('deleted_at');
    FormData.delete('total_inventory_count');
    // delete productJson.display_price;
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


    // was upsertProduct
    async upsert(FormData) {
        let response;
        stripRelations(FormData);

        if(FormData.get('id')) {
            response = await $axios.$put('/product', FormData);
        }
        else {
            response = await $axios.$post('/product', FormData);
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


    async uploadImage(formData) {
        const { data } = await $axios.$post('/product/image/upload', formData);
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
    async upsertSku(FormData) {
        FormData.delete('created_at');
        FormData.delete('updated_at');
        FormData.delete('deleted_at');

        let response;

        if(FormData.get('id')) {
            response = await $axios.$put('/product/sku', FormData);
        }
        else {
            response = await $axios.$post('/product/sku', FormData);
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
