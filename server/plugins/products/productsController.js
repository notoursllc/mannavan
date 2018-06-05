'use strict';

const isObject = require('lodash.isobject');
const Boom = require('boom');
const helperService = require('../../helpers.service');
const ProductPicService = require('./services/ProductPicService');


let server = null;
let productPicService;


function getProductModel() {
    return server.app.bookshelf.model('Product');
}

function getProductSizeModel() {
    return server.app.bookshelf.model('ProductSize');
}

function getProductPicModel() {
    return server.app.bookshelf.model('ProductPic');
}

function getProductPicVariantModel() {
    return server.app.bookshelf.model('ProductPicVariant');
}


async function setServer(server) {
    server = server;
    productPicService = new ProductPicService(server);
}


function getProductTypes() {
    return {
        PRODUCT_TYPE_APPAREL: 0x01 // 00000001
    };
}


function getProductSubTypes() {
    return {
        PRODUCT_SUBTYPE_HAT: 0x01, // 00000001
        PRODUCT_SUBTYPE_TOP: 0x02  // 00000010
    };
}


/**
 * Returns the integer representation for each binary gender type
 * @returns {}
 */
function getGenderTypes() {
    return {
        GENDER_TYPE_MENS: 0x01, // 00000001
        GENDER_TYPE_WOMENS: 0x02, // 00000010
        GENDER_TYPE_BOYS: 0x04, // 00000100
        GENDER_TYPE_GIRLS: 0x08  // 00001000
    };
}


function getSizeTypes() {
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


function getSizeTypeSortOrder(size) {
    let types = getSizeTypes();
    let index = types.indexOf(size);
    return index > -1 ? index : types.length;
}


function featuredProductPic(productJson) {
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


function getWithRelated(opts) {
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
async function getProductByAttribute(attrName, attrValue) {
    let forgeOpts = null;

    if(attrName) {
        forgeOpts = {};
        forgeOpts[attrName] = attrValue;
    }

    return await getProductModel().forge(forgeOpts).fetch({
        withRelated: getWithRelated()
    });
}


async function productShareHandler(request, reply) {
    try {
        let uriParts = request.query.uri.split('/');
        let seoUri = uriParts[uriParts.length - 1];

        const Product = await getProductByAttribute('seo_uri', seoUri);
        const p = isObject(Product) ? Product.toJSON() : {};
        const url = helperService.getSiteUrl(true);
        const urlImages = `${url}/images/`;
        const featuredPic = featuredProductPic(p);

        return await reply.view('views/socialshare', {
            title: p.title || `Welcome to ${helperService.getBrandName()}`,
            description: p.description_short || '',
            image: featuredPic ? `${urlImages}product/${featuredPic}` : `${urlImages}logo_header.png`,
            url: `${url}/${request.query.uri}`
        });
    }
    catch(err) {
        global.logger.error(err);
        global.bugsnag(err);
        reply(Boom.badRequest(err));
    }
}


async function getProductByIdHandler(request, reply) {
    try {
        const Products = await getProductModel()
            .forge({ id: request.query.id })
            .fetch({
                withRelated: getWithRelated(request.query)
            });

        reply.apiSuccess(Products);
    }
    catch(err) {
        global.logger.error(err);
        global.bugsnag(err);
        reply(Boom.badRequest(err));
    }
}


async function productSeoHandler(request, reply) {
    try {
        let withRelated = getWithRelated();
        withRelated.push('pics.pic_variants');

        const Products = await getProductModel()
            .forge({
                'seo_uri': request.query.id
            })
            .fetch({
                withRelated
            });

        reply.apiSuccess(Products);
    }
    catch(err) {
        global.logger.error(err);
        global.bugsnag(err);
        reply(Boom.badRequest(err));
    }
}


function productInfoHandler(request, reply) {
    reply.apiSuccess({
        types: getProductTypes(),
        subTypes: getProductSubTypes(),
        sizes: getSizeTypes(),
        genders: getGenderTypes()
    });
}


async function getProductsHandler(request, reply) {
    try {
        const Products = await HelperService.fetchPage(
            request,
            getProductModel(),
            getWithRelated()
        );

        reply.apiSuccess(
            Products,
            Products.pagination
        );
    }
    catch(err) {
        global.logger.error(err);
        global.bugsnag(err);
        reply(Boom.notFound(err));
    }
}


async function productCreateHandler(request, reply) {
    try {
        const Product = await getProductModel().create(request.payload);

        if(!Product) {
            reply(Boom.badRequest('Unable to create product.'));
            return;
        }

        reply.apiSuccess(
            Product.toJSON()
        );
    }
    catch(err) {
        global.logger.error(err);
        global.bugsnag(err);
        reply(Boom.badRequest(err));
    }
}


async function productUpdateHandler(request, reply) {
    try {
        request.payload.updated_at = request.payload.updated_at || new Date();

        const Product = await getProductModel().update(
            request.payload,
            { id: request.payload.id }
        );

        if(!Product) {
            reply(Boom.badRequest('Unable to find product.'));
            return;
        }

        reply.apiSuccess(
            Product.toJSON()
        );
    }
    catch(err) {
        global.logger.error(err);
        global.bugsnag(err);
        reply(Boom.badRequest(err));
    }
}


/***************************************
 * Product size route handlers
 /**************************************/
async function productSizeCreateHandler(request, reply) {
    try {
        request.payload.sort = request.payload.sort || getSizeTypeSortOrder(request.payload.size)

        const ProductSize = await getProductSizeModel().create(request.payload);

        if(!ProductSize) {
            reply(Boom.badRequest('Unable to create a a new product size.'));
            return;
        }

        reply.apiSuccess(
            ProductSize.toJSON()
        );
    }
    catch(err) {
        global.logger.error(err);
        global.bugsnag(err);
        reply(Boom.badRequest(err));
    }
}


async function productSizeUpdateHandler(request, reply) {
    try {
        request.payload.updated_at = request.payload.updated_at || new Date();

        const ProductSize = await getProductSizeModel().update(
            request.payload,
            { id: request.payload.id }
        );

        if(!ProductSize) {
            reply(Boom.badRequest('Unable to find product size.'));
            return;
        }

        reply.apiSuccess(
            ProductSize.toJSON()
        );
    }
    catch(err) {
        global.logger.error(err);
        global.bugsnag(err);
        reply(Boom.badRequest(err));
    }
}


async function productSizeDeleteHandler(request, reply) {
    try {
        request.payload.updated_at = request.payload.updated_at || new Date();

        const ProductSize = await getProductSizeModel().destroy(
            { id: request.payload.id }
        );

        if(!ProductSize) {
            reply(Boom.badRequest('Unable to find product size.'));
            return;
        }

        reply.apiSuccess(
            ProductSize.toJSON()
        );
    }
    catch(err) {
        global.logger.error(err);
        global.bugsnag(err);
        reply(Boom.badRequest(err));
    }
}


/***************************************
 * Product picture route handlers
 /**************************************/
async function productPicUpsertHandler(request, reply) {
    try {
        const productPicId = await productPicService.upsertProductPic(request);

        if(!productPicId) {
            reply(Boom.badRequest('Unable to create a a new product picture.'));
            return;
        }

        global.logger.info(
            request.payload.id ? 'PRODUCT PIC - DB UPDATED' : 'PRODUCT PIC - DB CREATED',
            productPicId
        );

        reply.apiSuccess({
            product_pic_id: productPicId
        });
    }
    catch(err) {
        global.logger.error(err);
        global.bugsnag(err);
        reply(Boom.badRequest(err));
    }
};


async function productPicDeleteHandler(request, reply) {
    try {
        request.payload.updated_at = request.payload.updated_at || new Date();

        try {
            await productPicService.unlinkFileAndVariants(request.payload.id);
        }
        catch(err) {
            // just dropping the exception beacuse issues deleting the file
            // shouldn't stop this process from continuing
            global.logger.error(err);
            global.bugsnag(err);
        }

        //TODO: Get the product.  If this is the featured pic, assign a new one on the product

        // Delete from DB:
        ProductPic = await getProductPicModel().destroy(
            { id: request.payload.id }
        );

        global.logger.info('DELETE FILE PRODUCT PIC SHOULD HAVE VARIANTS', ProductPic.toJSON())
        global.logger.info('PRODUCT PIC - DB DELETED2', request.payload.id);

        reply.apiSuccess({
            id: request.payload.id
        });
    }
    catch(err) {
        global.logger.error(err);
        global.bugsnag(err);
        reply(Boom.badRequest(err));
    }
};



module.exports = {
    getProductTypes,
    getProductSubTypes,
    getGenderTypes,
    getSizeTypes,
    getSizeTypeSortOrder,
    featuredProductPic,

    // route handlers
    productShareHandler,
    getProductByIdHandler,
    productSeoHandler,
    productInfoHandler,
    getProductsHandler,
    productCreateHandler,
    productUpdateHandler,
    productSizeCreateHandler,
    productSizeUpdateHandler,
    productSizeDeleteHandler,
    productPicUpsertHandler,
    productPicDeleteHandler
};
