import isObject from 'lodash.isobject';

/**
 * The cover image is the first image in the variant images array
 *
 * @param {*} variant
 * @param Number width
 */
export const getProductVariantCoverImage = (variant, width) => {
    let coverImage = null;

    if(isObject(variant) && Array.isArray(variant.images)) {
        coverImage = variant.images[0];
    }

    // Returing the entire image object if a specific
    // width has not been requested
    if(!width) {
        return coverImage;
    }

    if(isObject(coverImage) && coverImage.variants) {
        coverImage.variants.forEach((obj) => {
            if(obj.target_width === width) {
                coverImage = {
                    ...obj,
                    alt_text: coverImage.alt_text
                };
            }
        });
    }

    return coverImage;
};


/**
 * Returns the smallest variant of the cover image
 *
 * @param {*} variant
 */
export const getSmallestProductVariantCoverImage = (variant) => {
    const img = getProductVariantCoverImage(variant);
    let smallestImg = null;

    if(isObject(img)) {
        img.variants.forEach((v) => {
            if(!smallestImg || (v.target_width < smallestImg.target_width)) {
                smallestImg = v;
            }
        });
    }

    return smallestImg;
};


/**
 * Returns all product variant images of a given width
 *
 * @param {*} variant
 * @param Number width
 */
export const getAllProductVariantImagesAtWidth = (variant, width) => {
    const images = [];
    const w = width || 600;

    if(isObject(variant) && Array.isArray(variant.images)) {
        variant.images.forEach((obj) => {
            obj.variants.forEach((v) => {
                if(v.target_width === w) {
                    images.push({
                        ...v,
                        alt_text: obj.alt_text
                    });
                }
            });
        });
    }

    return images;
};
