'use strict';

const BaseService = require('../../core/services/BaseService');

module.exports = class ProductService extends BaseService {

    constructor(server) {
        super(server, 'Product')
    }


    getProductTypes() {
        return {
            PRODUCT_TYPE_APPAREL: 0x01 // 00000001
        };
    }


    getProductSubTypes() {
        return {
            PRODUCT_SUBTYPE_HAT: 0x01, // 00000001
            PRODUCT_SUBTYPE_TOP: 0x02  // 00000010
        };
    }


    /**
     * Returns the integer representation for each binary gender type
     * @returns {}
     */
    getGenderTypes() {
        return {
            GENDER_TYPE_MENS: 0x01, // 00000001
            GENDER_TYPE_WOMENS: 0x02, // 00000010
            GENDER_TYPE_BOYS: 0x04, // 00000100
            GENDER_TYPE_GIRLS: 0x08  // 00001000
        };
    }


    getSizeTypes() {
        return [
            'SIZE_YOUTH_XS',
            'SIZE_YOUTH_S',
            'SIZE_YOUTH_M',
            'SIZE_YOUTH_L',
            'SIZE_YOUTH_XL',
            'SIZE_ADULT_XS',
            'SIZE_ADULT_S',
            'SIZE_ADULT_M',
            'SIZE_ADULT_L',
            'SIZE_ADULT_XL',
            'SIZE_ADULT_2XL',
            'SIZE_ADULT_3XL',
            'SIZE_ADULT_4XL',
            'SIZE_ADULT_5XL'
        ];
    }


    getSizeTypeSortOrder(size) {
        let types = this.getSizeTypes();
        let index = types.indexOf(size);
        return index > -1 ? index : types.length;
    }


    featuredProductPic(productJson) {
        let pic = null;
    
        if(Array.isArray(productJson.pics)) {
            let len = productJson.pics.length;
    
            // The related sizes for a product are ordered by sort order (ASC)
            // so the first 'is_visible' pic will be the featured pic
            for(let i=0; i<len; i++) {
                if(productJson.pics[i].is_visible && productJson.pics[i].url) {
                    pic = productJson.pics[i].url;
                    break;
                }
            }
        }
    
        return pic;
    }


    getWithRelated(opts) {
        let options = opts || {};

        return [
            'artist',
            {
                sizes: (query) => {
                    if(!options.viewAllRelated) {
                        query.where('is_visible', '=', true);
                    }
                    query.orderBy('sort', 'ASC');
                },
    
                pics: (query) => {
                    if(!options.viewAllRelated) {
                        query.where('is_visible', '=', true);
                    }
                    query.orderBy('sort_order', 'ASC');
                }
            }
        ]
    }


    /**
     * Gets a product by a given attribute
     *
     * @param attrName
     * @param attrValue
     * @returns {Promise}
     */
    getProductByAttribute(attrName, attrValue) {
        let self = this;
        let forgeOpts = null;

        if(attrName) {
            forgeOpts = {};
            forgeOpts[attrName] = attrValue;
        }

        return self
            .getModel()
            .forge(forgeOpts)
            .fetch({
                withRelated: self.getWithRelated()
            });
    };
}