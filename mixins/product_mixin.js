import queryString from 'query-string';
import _forEach from 'lodash.foreach';
import isObject from 'lodash.isobject';


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

        goToProductDetails(seo_uri) {
            this.$router.push({
                name: 'p-seouri',
                params: { seouri: seo_uri }
            });
        },


        featuredProductPic(product) {
            let pic = null;

            if(Array.isArray(product.images)) {
                for(let i=0, len=product.images.length; i<len; i++) {
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
                    })
                }
            });

            return showChart;
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
        }

    }
}
