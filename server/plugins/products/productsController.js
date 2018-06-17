'use strict';

const isObject = require('lodash.isobject');
const Boom = require('boom');
const helperService = require('../../helpers.service');
const productPicController = require('./productPicController');
const productSizeController = require('./productSizeController');


let server = null;


function getModel() {
    return server.app.bookshelf.model('Product');
}


function setServer(s) {
    server = s;
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

    return await getModel().forge(forgeOpts).fetch({
        withRelated: getWithRelated()
    });
}


/***************************************
 * route handlers
 /**************************************/

async function productShareHandler(request, h) {
    try {
        let uriParts = request.query.uri.split('/');
        let seoUri = uriParts[uriParts.length - 1];

        const Product = await getProductByAttribute('seo_uri', seoUri);
        const p = isObject(Product) ? Product.toJSON() : {};
        const url = helperService.getSiteUrl(true);
        const urlImages = `${url}/images/`;
        const featuredPic = productPicController.featuredProductPic(p);

        return await h.view('views/socialshare', {
            title: p.title || `Welcome to ${helperService.getBrandName()}`,
            description: p.description_short || '',
            image: featuredPic ? `${urlImages}product/${featuredPic}` : `${urlImages}logo_header.png`,
            url: `${url}/${request.query.uri}`
        });
    }
    catch(err) {
        global.logger.error(err);
        global.bugsnag(err);
        throw Boom.badRequest(err);
    }
}


async function getProductByIdHandler(request, h) {
    try {
        const Products = await getModel()
            .forge({ id: request.query.id })
            .fetch({
                withRelated: getWithRelated(request.query)
            });

        return h.apiSuccess(Products);
    }
    catch(err) {
        global.logger.error(err);
        global.bugsnag(err);
        throw Boom.badRequest(err);
    }
}


async function productSeoHandler(request, h) {
    try {
        let withRelated = getWithRelated();
        withRelated.push('pics.pic_variants');

        const Products = await getModel()
            .forge({
                'seo_uri': request.query.id
            })
            .fetch({
                withRelated
            });

        return h.apiSuccess(Products);
    }
    catch(err) {
        global.logger.error(err);
        global.bugsnag(err);
        throw Boom.badRequest(err);
    }
}


function productInfoHandler(request, h) {
    return h.apiSuccess({
        types: getProductTypes(),
        subTypes: getProductSubTypes(),
        sizes: productSizeController.getSizeTypes(),
        genders: getGenderTypes()
    });
}


async function getProductsHandler(request, h) {
    try {
        const Products = await helperService.fetchPage(
            request,
            getModel(),
            getWithRelated()
        );

        return h.apiSuccess(
            Products,
            Products.pagination
        );
    }
    catch(err) {
        global.logger.error(err);
        global.bugsnag(err);
        throw Boom.notFound(err);
    }
}


async function productCreateHandler(request, h) {
    try {
        const Product = await getModel().create(request.payload);

        if(!Product) {
            throw Boom.badRequest('Unable to create product.');
        }

        return h.apiSuccess(
            Product.toJSON()
        );
    }
    catch(err) {
        global.logger.error(err);
        global.bugsnag(err);
        throw Boom.badRequest(err);
    }
}


async function productUpdateHandler(request, h) {
    try {
        request.payload.updated_at = request.payload.updated_at || new Date();

        const Product = await getModel().update(
            request.payload,
            { id: request.payload.id }
        );

        if(!Product) {
            throw Boom.badRequest('Unable to find product.');
        }

        return h.apiSuccess(
            Product.toJSON()
        );
    }
    catch(err) {
        global.logger.error(err);
        global.bugsnag(err);
        throw Boom.badRequest(err);
    }
}


module.exports = {
    setServer,
    getProductTypes,
    getProductSubTypes,
    getGenderTypes,
    getProductByAttribute,

    // route handlers
    productShareHandler,
    getProductByIdHandler,
    productSeoHandler,
    productInfoHandler,
    getProductsHandler,
    productCreateHandler,
    productUpdateHandler
};
