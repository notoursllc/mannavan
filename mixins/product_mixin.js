'use strict';

import queryString from 'query-string';
import _forEach from 'lodash.foreach';
import isObject from 'lodash.isobject';
import Promise from 'bluebird';


function stripRelations(productJson) {
    delete productJson.artist;
    delete productJson.sizes;
    delete productJson.pics;

    // also strip uneditable values:
    delete productJson.created_at;
    delete productJson.updated_at;
    delete productJson.display_price;

    return productJson;
}


export default {
    methods: {
        goToProductDetails(seo_uri, productTypeName) {
            this.$router.push({
                name: 'type-name-seouri',
                params: { name: productTypeName, seouri: seo_uri }
            });
        },


        goToAdminProductDetails(id) {
            this.$router.push({
                name: 'acts-product-id',
                params: { id }
            });
        },


        goToAdminProductUpsert(productId) {
            this.$router.push({
                name: 'acts-product-upsert-id',
                params: { id: productId }
            });
        },


        goToAdminProductAdd() {
            this.$router.push({
                name: 'acts-product-upsert-id'
            });
        },


        goToAdminProductList() {
            this.$router.push({
                name: 'acts-product-list'
            });
        },


        async getProducts(params) {
            let paramString = queryString.stringify(params, {arrayFormat: 'bracket'});

            const response = await this.$axios.$get(`/products?${paramString}`); // TODO: is there a XSS issue here?
            return response.data;
        },


        async getProductInfo() {
            const response = await this.$axios.$get('/product/info');
            return response.data;
        },


        async getProductBySeoUri(str) {
            const response = await this.$axios.$get('/product/seo', {
                params: {
                    id: str
                }
            });
            return response.data;
        },


        async getProductById(id, options) {
            let params = {};

            if(isObject(options)) {
                params = {
                    ...options
                };
            }

            params.id = id;

            const response = await this.$axios.$get('/product', {
                params
            });
            return response.data;
        },


        async getProductArtists(params) {
            let paramString = queryString.stringify(params, {arrayFormat: 'bracket'});

            const response = await this.$axios.$get(`/artists?${paramString}`); // TODO: is there a XSS issue here?
            return response.data;
        },


        async getProductArtistById(artistId) {
            const response = await this.$axios.$get('/artist', {
                params: {
                    id: artistId
                }
            });

            return response.data;
        },

        async upsertProductArtist(artist) {
            let uri = '/artist/create' ;

            if(artist.id) {
                uri = '/artist/update';
            }

            const response = await this.$axios.$post(uri, artist);
            return response.data;
        },

        async deleteProductArtist(artistId) {
            const response = await this.$axios.$delete('/artist', {
                params: {
                    id: artistId
                }
            });

            return response.data;
        },


        async getProductsForArtist(artistId) {
            const response = await this.$axios.$get('/artist/products', {
                params: {
                    id: artistId
                }
            });

            return response;
        },


        goToProductArtistList() {
            this.$router.push({
                name: 'acts-product-artist-list',
            });
        },

        goToProductArtistUpsert(id) {
            this.$router.push({
                name: 'acts-product-artist-upsert-id',
                params: { id: id }
            });
        },


        getProductSubTypeData(key) {
            const data = {
                // commenting out until we offer hats:
                // PRODUCT_SUBTYPE_HAT: {
                //     id: 1,
                //     label: 'hats'
                // },
                PRODUCT_SUBTYPE_TOP: {
                    id: 2,
                    label: 'tops'
                }
            };

            if(key && data.hasOwnProperty(key)) {
                return data[key];
            }
            return data;
        },


        featuredProductPic(product) {
            let pic = null;

            if(Array.isArray(product.pics)) {
                let len = product.pics.length;

                // The related sizes for a product are ordered by sort order (ASC)
                // so the first 'is_visible' pic will be the featured pic
                for(let i=0; i<len; i++) {
                    if(product.pics[i].is_visible) {
                        pic = product.pics[i].url;
                        break;
                    }
                }

                if(pic) {
                    return pic;
                }
            }

            return;
        },


        async upsert(product) {
            let target = '/product/create';

            if(product.id) {
                target = '/product/update'
            }

            const response = await this.$axios.$post(
                target,
                stripRelations(product)
            );

            return response.data;
        },


        buildPictures(product) {
            let sortObj = {};
            let added = [];

            function add(sortOrder, val) {
                let order = sortOrder || 100;

                if(added.indexOf(val) === -1) {
                    added.push(val);

                    if(!sortObj.hasOwnProperty(order)) {
                        sortObj[order] = [];
                    }

                    sortObj[order].push(val);
                }
            }

            function getSortedArray(sortObj) {
                let vals = [];

                _forEach(sortObj, (arr) => {
                    if(Array.isArray(arr)) {
                        arr.forEach((val) => {
                            vals.push(val);
                        })
                    }
                });

                return vals;
            }

            return new Promise((resolve, reject) => {
                if (Array.isArray(product.pics)) {
                    product.pics.forEach((obj) => {
                        if (obj.is_visible && obj.url) {
                            add(obj.sort_order, obj.url)
                        }
                    });
                }

                resolve(getSortedArray(sortObj));
            });
        },


        /**
         * Get the product subtype id for a given label (english string)
         *
         * @param {*} type  hats | tops
         */
        getIdByProductType(type) {
            let id = 0;
            let subtype = null;

            // TODO: is using 'this' going to work if this method
            // is not called when this mixin is not used as a component mixin?
            let data = this.getProductSubTypeData();

            _forEach(data, (obj, key) => {
                if (obj.label === type) {
                    id = obj.id;
                    subtype = key;
                }
            });

            return {
                productTypeId: id,
                productSubType: subtype
            };
        },


        /******************************
         * Product Sizes
         ******************************/

        buildSizeOptions(product) {
            let sizeOpts = [];
            let maxInventoryCount = 0;

            if (Array.isArray(product.sizes)) {
                product.sizes.forEach((obj) => {
                    if (obj.is_visible && obj.inventory_count) {
                        sizeOpts.push(obj.size);

                        if (obj.total_inventory_count > maxInventoryCount) {
                            maxInventoryCount = obj.inventory_count;
                        }
                    }
                });
            }

            return {
                sizeOpts,
                maxInventoryCount
            };
        },


        async buildMissingSizeOptions(sizes) {
            const productInfo = await this.getProductInfo();

            if(!productInfo) {
                throw new Error(this.$t('Product sizes not found'));
            }

            let usedSizeIds = [];
            let options = [];

            if(Array.isArray(sizes)) {
                sizes.forEach((size) => {
                    usedSizeIds.push(size.size);
                });
            }

            productInfo.sizes.forEach((id) => {
                if(usedSizeIds.indexOf(id) === -1) {
                    options.push(id);
                }
            });

            return options;
        },


        async upsertProductSize(size) {
            let uri = '/product/size/create' ;

            if(size.id) {
                uri = '/product/size/update';
            }

            delete size.updated_at;
            delete size.created_at;

            const response = await this.$axios.$post(uri, size);
            return response.data;
        },




        async deleteProductSize(sizeId) {
            const response = await this.$axios.$post(`/product/size/delete`, { id: sizeId })
            return response.data;
        },


        /******************************
         * Product Pictures
         ******************************/

        async upsertProductPicture(formData) {
            const response = await this.$axios.$post(
                '/product/pic/upsert',
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            )
            return response.data;
        },


        async deleteProductPicture(id) {
            const response = await this.$axios.$post(`/product/pic/delete`, { id });
            return response.data;
        }
    }
}
