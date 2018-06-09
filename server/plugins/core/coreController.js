'use strict';

const path = require('path');
const fs = require('fs');
const Boom = require('boom');
const uuidV4 = require('uuid/v4');
const jwt = require('jsonwebtoken');
const helperService = require('../../helpers.service');

let server = null;


function setServer(s) {
    server = s;
}


async function getClientJwtHandler(request, h) {
    try {
        let uuid = uuidV4();

        const cartToken = await helperService.cryptPassword(process.env.CART_TOKEN_SECRET + uuid);

        if(!cartToken) {
            throw new Error('Error creating cart token');
        }

        const jsonWebToken = jwt.sign(
            {
                jti: uuid,
                clientId: process.env.JWT_CLIENT_ID, // is this needed?
                ct: cartToken
            },
            process.env.JWT_SERVER_SECRET
        );

        const response = h.response('success');
        response.type('text/plain');
        response.header('Authorization', jsonWebToken);
        return response;
    }
    catch(err) {
        throw Boom.unauthorized(err);
    }
};


function loggerHandler(request, h) {
    switch(request.payload.type) {
        // Only supportig the 'error' and 'info' types for now
        case 'error':
            global.logger.error(request.payload.message);
            break;

        default:
            global.logger.info(request.payload.message);
    }

    h.apiSuccess();
}


function faviconHandler(request, h) {
    // TODO: not sure if this is right
    h.response(fs.createReadStream(path.resolve(__dirname, '../../../dist/static/favicon.ico'))).code(200).type('image/x-icon');
}


module.exports = {
    setServer,
    getClientJwtHandler,
    loggerHandler,
    faviconHandler
}
