'use strict';

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
    artistListHandler,
    artistDeleteHandler,
    artistGetProductsHandler
}
