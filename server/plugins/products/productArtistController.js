'use strict';

const Joi = require('joi');
const Boom = require('boom');
const helperService = require('../../helpers.service');
const globalTypes = require('../../../client_server_shared/global_types.js');
const queryString = require('query-string');

let server = null;


function getModel() {
    return server.app.bookshelf.model('ProductArtist');
}


function setServer(s) {
    server = s;
}


function getProductArtistSchema() {
    return {
        name: Joi.string().max(100).required(),
        email: Joi.string().max(100).optional(),
        icon: Joi.any().optional(),
        city: Joi.string().max(100).optional(),
        prov_state: Joi.string().max(100).optional(),
        country: Joi.string().length(2).optional(),
        description_long: Joi.string().optional(),
        description_short: Joi.string().optional(),
        created_at: Joi.date(),
        updated_at: Joi.date()
    };
}


/**
 * Gets a product artist by a given attribute, or all results if no attributes are passed
 *
 * @param attrName
 * @param attrValue
 * @returns {Promise}
 */
async function getProductArtistByAttribute(attrName, attrValue) {
    let forgeOpts = null;

    if(attrName) {
        forgeOpts = {};
        forgeOpts[attrName] = attrValue;
    }

    return await getModel().forge(forgeOpts).fetch();
}



/***************************************
 * route handlers
 /**************************************/

 async function artistListHandler(request, h) {
    try {
        const ProductArtists = await helperService.fetchPage(
            request,
            getModel()
        );

        return h.apiSuccess(
            ProductArtists,
            ProductArtists.pagination
        );
    }
    catch(err) {
        global.logger.error(err);
        global.bugsnag(err);
        throw Boom.notFound(err);
    }
}


/**
 * Route handler for getting a ProductArtist by ID
 *
 * @param {*} request
 * @param {*} h
 */
async function getProductArtistByIdHandler(request, h) {
    try {
        const ProductArtist = await getProductArtistByAttribute('id', request.query.id)
        return h.apiSuccess(ProductArtist);
    }
    catch(err) {
        global.logger.error(err);
        global.bugsnag(err);
        throw Boom.badRequest(err);
    }
}


/**
 * Route handler for creating a new ProductArtist
 *
 * @param {*} request
 * @param {*} h
 */
async function artistCreateHandler(request, h) {
    try {
        const ProductArtist = await getModel().create(request.payload);

        if(!ProductArtist) {
            throw Boom.badRequest('Unable to create a a new product artist.');
        }

        return h.apiSuccess(
            ProductArtist.toJSON()
        );
    }
    catch(err) {
        global.logger.error(err);
        global.bugsnag(err);
        throw Boom.badRequest(err);
    }
}


/**
 * Route handler for updating a package type
 *
 * @param {*} request
 * @param {*} h
 */
async function artistUpdateHandler(request, h) {
    try {
        request.payload.updated_at = request.payload.updated_at || new Date();

        const ProductArtist = await getModel().update(
            request.payload,
            { id: request.payload.id }
        );

        if(!ProductArtist) {
            throw Boom.badRequest('Unable to find product artist.');
        }

        return h.apiSuccess(
            ProductArtist.toJSON()
        );
    }
    catch(err) {
        global.logger.error(err);
        global.bugsnag(err);
        throw Boom.badRequest(err);
    }
}


async function artistDeleteHandler(request, h) {
    try {
        const ProductArtist = await getModel().destroy(
            { id: request.query.id }
        );

        if(!ProductArtist) {
            throw Boom.badRequest('Unable to find product artist.');
        }

        return h.apiSuccess(
            ProductArtist.toJSON()
        );
    }
    catch(err) {
        global.logger.error(err);
        global.bugsnag(err);
        throw Boom.badRequest(err);
    }
}


async function artistGetProductsHandler(request, h) {
    try {
        let parsed = queryString.parse(request.url.search, {arrayFormat: 'bracket'});
        parsed.where = [
            'product_artist_id',
            '=',
            request.query.id
        ];

        request.url.search = '?' + queryString.stringify(parsed, {sort: false, arrayFormat: 'bracket'})

        const Products = await helperService.fetchPage(
            request,
            server.app.bookshelf.model('Product')
        );

        return h.apiSuccess(
            Products,
            Products.pagination
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
    getProductArtistSchema,
    getProductArtistByAttribute,
    artistListHandler,
    artistCreateHandler,
    artistUpdateHandler,
    getProductArtistByIdHandler,
    artistDeleteHandler,
    artistGetProductsHandler
}
