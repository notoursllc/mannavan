'use strict';

const Boom = require('boom');
const JWT = require('jsonwebtoken');
const Cookie = require('cookie');
const isObject = require('lodash.isobject');
const Hoek = require('hoek');
const internals = {};


internals.isValid = (token) => {
    return token.split('.').length === 3;
}

internals.defaultOptions = {
    cookieKey: 'jwt'
};

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
internals.implementation = function (server, options) {
    const scheme = {
        authenticate: function (request, reply) {
            const settings = Hoek.applyToDefaults(internals.defaultOptions, options);

            const token = Cookie.parse(request.headers.cookie)[settings.cookieKey];
            let decoded;

            if (!token) {
                return reply(Boom.unauthorized(null, 'jwt-cookie'));
            }

            if (!internals.isValid(token)) { // quick check for validity of token format
                return reply(Boom.unauthorized('Invalid cart token format', 'jwt-cookie'));
            }

            if (!options.secret) {
                return reply(Boom.badImplementation('Cart token secret was not provided'));
            }

            if (options.verifyOptions && !isObject(options.verifyOptions)) {
                return reply(Boom.badImplementation('verifyOptions must be an object'));
            }

            try {
                decoded = JWT.decode(token);
            }
            catch (e) {
                // request should still FAIL if the token does not decode.
                return reply(Boom.unauthorized('Invalid cart token format', 'jwt-cookie'));
            }

            JWT.verify(
                token,
                options.secret,
                options.verifyOptions || {},
                function (err, decoded) {
                    if (err) {
                        return reply(
                            Boom.unauthorized('Invalid cart token', 'jwt-cookie'),
                            null,
                            { credentials: decoded }
                        );
                    }

                    // For convenience, adding the token to the request
                    request.auth.cookieToken = token;

                    // Authenticated
                    return reply.continue({
                        credentials: decoded,
                        artifacts: token
                    });
                }
            );
        }
    }

    return scheme;
}


exports.register = function (plugin, options, next) {
    plugin.auth.scheme('jwt-cookie', internals.implementation);
    return next();
};

exports.register.attributes = {
    pkg: require('./package.json')
};
