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


async function getClientJwtHandler(request, reply) {
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

        reply().header("Authorization", jsonWebToken);
    }
    catch(err) {
        global.logger.error(err);
        global.bugsnag(err);
        reply(Boom.unauthorized(err));
    }
};


function loggerHandler(request, reply) {
    switch(request.payload.type) {
        // Only supportig the 'error' and 'info' types for now
        case 'error':
            global.logger.error(request.payload.message);
            break;

        default:
            global.logger.info(request.payload.message);
    }

    reply.apiSuccess();
}


function faviconHandler(request, reply) {
    reply(null, fs.createReadStream(path.resolve(__dirname, '../../../dist/static/favicon.ico'))).code(200).type('image/x-icon');
}


module.exports = {
    setServer,
    getClientJwtHandler,
    loggerHandler,
    faviconHandler
}
