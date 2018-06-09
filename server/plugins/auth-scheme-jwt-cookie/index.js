'use strict';

const Boom = require('boom');
const JWT = require('jsonwebtoken');
const Cookie = require('cookie');
const isObject = require('lodash.isobject');
const Hoek = require('hoek');


/**
 * Pretty basic implementation without any bells and whistles
 * More features here that can be added in the future:
 * https://www.npmjs.com/package/jsonwebtoken
 *
 * @param {*} server
 * @param {*} options
 *
 * Example options:
 * {
 *   cookieKey: 'token' (optional),
 *   secret: 'myJwtSecret' (required)
 * }
 */
const implementation = function (server, options) {
    const scheme = {
        authenticate: function (request, h) {
            const settings = Hoek.applyToDefaults(
                { cookieKey: 'jwt' },
                options
            );

            // console.log("REQUEST STATE", request.state)
            // console.log("REQUEST COOKIE", request.headers.cookie)

            if (!request.headers.cookie) {
                return h.unauthenticated(Boom.unauthorized('Missing cookie', 'jwt-cookie'));
            }

            const token = Cookie.parse(request.headers.cookie)[settings.cookieKey];
            let decoded;

            if (!token) {
                return h.unauthenticated(Boom.unauthorized(null, 'jwt-cookie'));
            }

            if (token.split('.').length !== 3) { // quick check for validity of token format
                return h.unauthenticated(Boom.unauthorized('Invalid cart token format', 'jwt-cookie'));
            }

            if (!options.secret) {
                return h.unauthenticated(Boom.badImplementation('Cart token secret was not provided'));
            }

            if (options.verifyOptions && !isObject(options.verifyOptions)) {
                return h.unauthenticated(Boom.badImplementation('verifyOptions must be an object'));
            }

            try {
                decoded = JWT.decode(token);
            }
            catch (e) {
                // request should still FAIL if the token does not decode.
                return h.unauthenticated(Boom.unauthorized('Invalid cart token format', 'jwt-cookie'));
            }

            let verify_decoded;
            try {
                verify_decoded = JWT.verify(
                    token,
                    options.secret,
                    options.verifyOptions || {}
                );
            }
            catch(verify_err) {
                return h.unauthenticated(Boom.unauthorized('Invalid cart token', 'jwt-cookie'));
            }

            return h.authenticated({
                credentials: verify_decoded,
                artifacts: token
            });
        }
    }

    return scheme;
}


exports.plugin = {
    once: true,
    pkg: require('./package.json'),
    register: function (server, options) {
        server.auth.scheme('jwt-cookie', implementation);
    }
};
