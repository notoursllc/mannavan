import isObject from 'lodash.isobject';

export default {
    methods: {

        goToProductDetails(seo_uri) {
            this.$router.push({
                name: 'p-seouri',
                params: { seouri: seo_uri }
            });
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


        prodMix_getVariantImagesAtWidth(variant, width) {
            const images = [];
            const w = width || 600;

            if(isObject(variant) && Array.isArray(variant.images)) {
                variant.images.forEach((obj) => {
                    obj.variants.forEach((v) => {
                        if(v.target_width === w) {
                            images.push({
                                alt_text: obj.alt_text,
                                url: v.url
                            });
                        }
                    });
                });
            }

            return images;
        },


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
