'use strict';

const Boom = require('boom');

let server = null;


function getModel() {
    return server.app.bookshelf.model('ProductSize');
}


function setServer(s) {
    server = s;
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


/***************************************
 * route handlers
 /**************************************/

 async function productSizeCreateHandler(request, h) {
    try {
        request.payload.sort = request.payload.sort || getSizeTypeSortOrder(request.payload.size)

        const ProductSize = await getModel().forge().save(
            request.payload,
            { method: 'insert' }
        )

        if(!ProductSize) {
            throw Boom.badRequest('Unable to create a a new product size.');
        }

        return h.apiSuccess(
            ProductSize.toJSON()
        );
    }
    catch(err) {
        global.logger.error(err);
        global.bugsnag(err);
        throw Boom.badRequest(err);
    }
}


 async function productSizeUpdateHandler(request, h) {
    try {
        const ProductSize = await getModel().forge().save(
            request.payload,
            { method: 'update', patch: true }
        )

        if(!ProductSize) {
            throw Boom.badRequest('Unable to find product size.');
        }

        return h.apiSuccess(
            ProductSize.toJSON()
        );
    }
    catch(err) {
        global.logger.error(err);
        global.bugsnag(err);
        throw Boom.badRequest(err);
    }
}


async function productSizeDeleteHandler(request, h) {
    try {
        const ProductSize = await getModel().destroy(
            { id: request.payload.id }
        );

        if(!ProductSize) {
            throw Boom.badRequest('Unable to find product size.');
        }

        return h.apiSuccess(
            ProductSize.toJSON()
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
    getSizeTypes,
    getSizeTypeSortOrder,
    productSizeCreateHandler,
    productSizeUpdateHandler,
    productSizeDeleteHandler
}
