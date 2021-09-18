import isObject from 'lodash.isobject';

/**
 * The cover image is the first image in the variant images array
 *
 * @param {*} variant
 * @param Number width
 */
export const getProductVariantCoverImage = (variant) => {
    return isObject(variant) && Array.isArray(variant.images) ? variant.images[0].third_party_id : null;
};
