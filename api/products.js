import queryString from 'query-string';
import isObject from 'lodash.isobject';


function stripRelations(productJson) {
    // delete productJson.artist;
    // delete productJson.sizes;
    // delete productJson.pics;
    // delete productJson.tax;
    // delete productJson.variations;
    // delete productJson.package_type;
    delete productJson.skus;

    // also strip uneditable values:
    delete productJson.created_at;
    delete productJson.updated_at;
    // delete productJson.display_price;
    delete productJson.total_inventory_count;

    return productJson;
}


export default ($axios) => ({

    // was getProducts
    async list(params) {
        let paramString = queryString.stringify(params, {arrayFormat: 'bracket'});

        // const response = await this.$axios.$get(`/products?${paramString}`); // TODO: is there a XSS issue here?
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
    async upsert(product) {
        let response;
        let cleanProduct = stripRelations(product);

        if(product.id) {
            response = await $axios.$put('/product', cleanProduct);
        }
        else {
            response = await $axios.$post('/product', cleanProduct);
        }

        return response.data;
    },


    // was deleteProduct
    async delete(id) {
        const { data } = await this.$axios.$delete(`/product`, {
            params: {
                id
            }
        });
        return data;
    },





});
