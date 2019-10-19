'use strict';

import queryString from 'query-string';
import _forEach from 'lodash.foreach';
import isObject from 'lodash.isobject';
import Promise from 'bluebird';


function stripRelations(productJson) {
    delete productJson.artist;
    delete productJson.sizes;
    delete productJson.pics;
    delete productJson.tax;
    delete productJson.variations;
    delete productJson.package_type;

    // also strip uneditable values:
    delete productJson.created_at;
    delete productJson.updated_at;
    delete productJson.display_price;
    delete productJson.total_inventory_count;

    return productJson;
}


export default {
    methods: {
        async getProducts(params) {
            let paramString = queryString.stringify(params, {arrayFormat: 'bracket'});

            // const response = await this.$axios.$get(`/products?${paramString}`); // TODO: is there a XSS issue here?
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


        async deleteProduct(id) {
            const response = await this.$axios.$delete(`/product`, {
                params: {
                    id
                }
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
            let response;

            if(artist.id) {
                response = await this.$axios.$put('/artist', artist);
            }
            else {
                response = await this.$axios.$post('/artist', artist);
            }

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


        async prodmix_variations(product_id) {
            const response = await this.$axios.$get('/product/variations', {
                params: {
                    product_id
                }
            });

            return response.data;
        },



        /******************************
         * Product Sub Types
         ******************************/

        getProductSubTypes(onlyAvailable) {
            const subTypes = Object.assign({}, this.$store.state.product.subTypes);

            Object.keys(subTypes).forEach((key) => {
                if(onlyAvailable && !subTypes[key].is_available) {
                    delete subTypes[key];
                }
            });

            return subTypes;
        },

        prodmix_getSubTypeLabel(value) {
            const subTypes = this.getProductSubTypes(true);
            const values = [];

            Object.keys(subTypes).forEach((key) => {
                if(value & subTypes[key].value) {
                    values.push(
                        this.$t(subTypes[key].name)
                    );
                }
            });

            return values.join(', ');
        },


        /******************************
         * Navigation
         ******************************/

        goToProductDetails(seo_uri) {
            this.$router.push({
                name: 'p-seouri',
                params: { seouri: seo_uri }
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


        featuredProductPic(product) {
            let pic = null;

            if(Array.isArray(product.variations)) {
                product.variations.forEach((variation) => {
                    if(variation.published && Array.isArray(variation.pics)) {
                        let len = variation.pics.length;

                        // The related pics for a product variant are ordered by sort order (ASC)
                        // so the first 'is_visible' pic will be the featured pic
                        for(let i=0; i<len; i++) {
                            if(variation.pics[i].is_visible) {
                                pic = variation.pics[i].url;
                                break;
                            }
                        }
                    }
                })
            }

            return pic;
        },


        async upsertProduct(product) {
            let response;
            let cleanProduct = stripRelations(product);

            if(product.id) {
                response = await this.$axios.$put('/product', cleanProduct);
            }
            else {
                response = await this.$axios.$post('/product', cleanProduct);
            }

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


        /******************************
         * Product Sizes
         ******************************/

        // TODO: refactor this to get size options from product variation
        buildSizeOptions(product) {
            let sizeOpts = [];
            let maxInventoryCount = 0;

            if (isObject(product) && Array.isArray(product.sizes)) {
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


        getInventoryCountForSize(selectedSize, product) {
            let inventoryCount = null;

            if(selectedSize && Array.isArray(product.sizes)) {
                product.sizes.forEach((size) => {
                    if(selectedSize === size.size && size.hasOwnProperty('inventory_count')) {
                        inventoryCount = size['inventory_count'];
                    }
                });
            }

            return inventoryCount;
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




        async deleteProductSize(id) {
            const response = await this.$axios.$delete(`/product/size`, {
                params: {
                    id
                }
            });
            return response.data;
        },


        /******************************
         * Product Pictures
         ******************************/

        async upsertProductPicture(formData) {
            const response = await this.$axios.$post(
                '/product/pic',
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            )
            return response.data;
        },


        async deleteProductPicture(id) {
            const response = await this.$axios.$delete(`/product/pic`, {
                params: {
                    id
                }
            });
            return response.data;
        }

    }
}
