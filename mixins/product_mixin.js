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


        getProducts(params) {
            let paramString = queryString.stringify(params, {arrayFormat: 'bracket'});

            return this.$axios
                .$get(`/products?${paramString}`) // TODO: is there a XSS issue here?
                .then((response) => {
                    return response.data;
                });
        },


        getProductInfo() {
            return this.$axios
                .$get('/product/info')
                .then((response) => {
                    return response.data;
                });
        },


        getProductBySeoUri(str) {
            return this.$axios
                .$get('/product/seo', {
                    params: {
                        id: str
                    }
                })
                .then((response) => {
                    return response.data;
                });
        },


        getProductById(id, options) {
            let params = {};

            if(isObject(options)) {
                params = {
                    ...options
                };
            }

            params.id = id;

            return this.$axios
                .$get('/product', {
                    params
                })
                .then((response) => {
                    return response.data;
                });
        },


        getProductSubTypeData(key) {
            const data = {
                PRODUCT_SUBTYPE_HAT: {
                    id: 1,
                    label: 'hats',
                    svg: 'icon_cap.svg'
                },
                PRODUCT_SUBTYPE_TOP: {
                    id: 2,
                    label: 'tops',
                    svg: 'icon_tshirt.svg'
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


        upsert(product) {
            let target = '/product/create';

            if(product.id) {
                target = '/product/update'
            }

            return this.$axios
                .$post(
                    target,
                    stripRelations(product)
                )
                .then((response) => {
                    return response.data;
                });
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

        // buildSizeOptions(product) {
        //     return new Promise((resolve, reject) => {
        //         let sizeOpts = [];
        //         let maxInventoryCount = 0;

        //         if (Array.isArray(product.sizes)) {
        //             product.sizes.forEach((obj) => {
        //                 if (obj.is_visible && obj.inventory_count) {
        //                     sizeOpts.push(obj.size);

        //                     if (obj.inventory_count > maxInventoryCount) {
        //                         maxInventoryCount = obj.inventory_count;
        //                     }
        //                 }
        //             });
        //         }

        //         resolve({
        //             sizeOpts,
        //             maxInventoryCount
        //         });
        //     });
        // },

        buildSizeOptions(product) {
            let sizeOpts = [];
            let maxInventoryCount = 0;

            if (Array.isArray(product.sizes)) {
                product.sizes.forEach((obj) => {
                    if (obj.is_visible && obj.inventory_count) {
                        sizeOpts.push(obj.size);

                        if (obj.inventory_count > maxInventoryCount) {
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


        buildMissingSizeOptions(sizes) {
            return this.getProductInfo()
                .then((productInfo) => {
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
                });
        },


        createProductSize(size) {
            return this.$axios
                .$post(`/product/size/create`, size)
                .then((response) => {
                    return response.data;
                });
        },


        updateProductSize(size) {
            return this.$axios
                .$post(`/product/size/update`, size)
                .then((response) => {
                    return response.data;
                });
        },


        deleteProductSize(sizeId) {
            return this.$axios
                .$post(`/product/size/delete`, { id: sizeId })
                .then((response) => {
                    return response.data;
                });
        },


        /******************************
         * Product Pictures
         ******************************/

        upsertProductPicture(formData) {
            return this.$axios
                .$post(
                    '/product/pic/upsert',
                    formData,
                    { headers: { 'Content-Type': 'multipart/form-data' } }
                )
                .then((response) => {
                    return response.data;
                });
        },


        deleteProductPicture(id) {
            return this.$axios
                .$post(`/product/pic/delete`, { id })
                .then((response) => {
                    return response.data;
                });
        }
    }
}
