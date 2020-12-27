import isObject from 'lodash.isobject';

export default {
    methods: {

        goToProductDetails(seo_uri) {
            this.$router.push({
                name: 'p-seouri',
                params: { seouri: seo_uri }
            });
        },

        getSkusWithAttribute(product, attributeLabel) {
            let id = null;
            const skus = [];

            if(isObject(product)
                && Array.isArray(product.attributes)
                && Array.isArray(product.skus)) {

                // find the id of the attribute with a label that matches attributeLabel
                product.attributes.forEach((obj) => {
                    if(obj.label === attributeLabel) {
                        id = obj.id;
                    }
                });

                if(id) {
                    // collect every product sku that contains an attribute with an optionId value of [id]
                    product.skus.forEach((sku) => {
                        if(Array.isArray(sku.attributes)) {
                            sku.attributes.forEach((attr) => {
                                if(attr.optionId === id) {
                                    skus.push(sku);
                                }
                            });
                        }
                    });
                }
            }

            return {
                skus: skus,
                attributeId: id
            };

        },


        /*
        * The first variant image is the 'cover' image
        */
        prodMix_getVariantCoverImage(variant) {
            if(isObject(variant) && Array.isArray(variant.images)) {
                return variant.images[0];
            }

            return null;
        },


        prodMix_getSkuImages(sku) {
            const images = [];

            if(isObject(sku) && Array.isArray(sku.images)) {
                sku.images.forEach((obj) => {
                    if(obj.published && obj.media.resource_type === 'IMAGE') {
                        images.push({
                            alt_text: obj.alt_text,
                            url: obj.media.url
                        });
                    }
                });
            }

            console.log("prodMix_getSkuImages DONE", images)

            return images;
        },


        // prodMix_getFeaturedMediaForSku(sku) {
        //     let media = null;

        //     if(isObject(sku) && Array.isArray(sku.images)) {
        //         for(let i=0, len=sku.images.length; i<len; i++) {
        //             const img = sku.images[i];

        //             if(img.published && img.is_featured && img.media) {
        //                 media = img.media;
        //                 break;
        //             }
        //         }
        //     }

        //     return media;
        // },


        featuredProductPic(product) {
            let pic = null;

            if(Array.isArray(product.images)) {
                for(let i = 0, len = product.images.length; i < len; i++) {
                    if(product.images[i].published) {
                        pic = product.images[i].image_url;
                        break;
                    }
                }
            }

            return pic;
        },


        /*
        * Looking for a property called 'showSizeChart' in the product subtype's meta data
        */
        metaShowSizeChart(subTypeId) {
            let showChart = false;

            this.$store.state.product.subTypes.forEach((obj) => {
                if(obj.value === subTypeId && Array.isArray(obj.metadata)) {
                    obj.metadata.forEach((metaObj) => {
                        if(metaObj.hasOwnProperty('showSizeChart')) {
                            showChart = !!parseInt(metaObj.showSizeChart, 10);
                        }
                    });
                }
            });

            return showChart;
        },


        /******************************
         * Product Sizes
         ******************************/

        // TODO: refactor this to get size options from product variation
        buildSizeOptions(product) {
            const sizeOpts = [];
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


        getInventoryCountForSize(selectedSize, product) {
            let inventoryCount = null;

            if(selectedSize && Array.isArray(product.sizes)) {
                product.sizes.forEach((size) => {
                    if(selectedSize === size.size && size.hasOwnProperty('inventory_count')) {
                        inventoryCount = size.inventory_count;
                    }
                });
            }

            return inventoryCount;
        }

    }
};
