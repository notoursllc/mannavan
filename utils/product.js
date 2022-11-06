import isObject from 'lodash.isobject';

/**
 * The cover image is the first image in the variant images array
 *
 * @param {*} variant
 * @param Number width
 */
export const getProductVariantCoverImage = (variant) => {
    if(isObject(variant) && variant.images?.[0]?.url) {
        return variant.images[0];
    }
    return null;
};
