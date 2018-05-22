const path = require('path');
const fs = require('fs');
const Joi = require('joi');
const Boom = require('boom');
const isObject = require('lodash.isobject');
const uuidV4 = require('uuid/v4');
const jwt = require('jsonwebtoken');
const helperService = require('../../helpers.service');


let internals = {};


/************************************
 * ROUTE HANDLERS
 ************************************/




internals.after = (server, next) => {

    internals.getClientJwt = (request, reply) => {
        let uuid = uuidV4();

        global.logger.error("SERVER INFO", server.info)

        helperService
            .cryptPassword(process.env.CART_TOKEN_SECRET + uuid)
            .then((cartToken) => {
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
            })
            .catch((err) => {
                global.logger.error(err);
                reply(Boom.unauthorized(err));
            });
    };


    /*
     * Route authentication
     */
    server.register(require('../auth-scheme-jwt-cookie'));
    server.auth.strategy('xCartToken', 'jwt-cookie', {
         secret: process.env.JWT_SERVER_SECRET,
         cookieKey: 'cart-jwt',
         verifyOptions: {   // https://github.com/auth0/node-jsonwebtoken#jwtverifytoken-secretorpublickey-options-callback
             ignoreExpiration: true,    // do not reject expired tokens
             algorithms: [ 'HS256' ]
         }
     });
    server.auth.default('xCartToken')


    server.views({
        engines: {
            html: require('handlebars')
        },
        path: path.resolve(__dirname, '../../../dist')
        // partialsPath: '../../views/partials',
        // relativeTo: __dirname // process.cwd() // prefer this over __dirname when compiling to dist/cjs and using rollup
    });

    server.decorate('reply', 'apiSuccess', function (responseData, paginationObj) {
        let response = {};
        response.data = responseData;

        if(isObject(paginationObj)) {
            response.pagination = paginationObj;
        }

        return this.response(response);
    });

    // Handle Boom errors
    server.ext('onPreResponse', function (request, reply) {
        if (request.response.isBoom) {
            if(process.env.NODE_ENV !== 'test') {
                global.logger.error(request.response)
            }
        }
        return reply.continue();
    });

    let routes = [
        {
            method: 'GET',
            path: '/api/v1/jwt',
            config: {
                auth: false,
                description: 'Returns the client token',
                handler: internals.getClientJwt
            }
        },
        {
            method: 'POST',
            path: '/api/v1/logger',
            config: {
                description: 'Logs stuff',
                validate: {
                    payload: Joi.object({
                        type: Joi.string(),
                        message: Joi.string()
                    })
                },
                handler: function (request, reply) {
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
            }
        }

        // commentig out to get nuxt working (?)
        // {
        //     method: 'GET',
        //     path: '/{path*}',
        //     config: {
        //         auth: false
        //     },
        //     handler: function (request, reply) {
        //         reply.file(path.resolve(__dirname, '../../../dist/index.html'));

        //         // TODO: get CSRF token to add to template?
        //         // return reply.view('index', {
        //         //     crumb: 123
        //         // });
        //         // return reply.view('index', {});
        //     }
        // }
    ];

    // nginx handles static file access in production, for better performance
    // so only add these routes if running locally.
    // Even so it's probably best to develop locally using Nanobox, so perhaps
    // this can be removed
    if(process.env.IS_LOCAL) {
        routes.unshift(
            {
                method: 'GET',
                path: '/static/{filepath*}',
                config: {
                    auth: false,
                    cache: {
                        expiresIn: 24 * 60 * 60 * 1000,
                        privacy: 'public'
                    }
                },
                handler: {
                    directory: {
                        path: path.resolve(__dirname, '../../../dist/static/'),
                        listing: false,
                        index: false
                    }
                }
            },
            {
                path: '/favicon.ico',
                method: 'get',
                config: {
                    auth: false,
                    cache: {
                        expiresIn: 1000*60*60*24*21
                    }
                },
                handler: function(request, reply) {
                    // if (!options.path) {
                    //     return reply().code(204).type('image/x-icon');
                    // }
                    reply(null, fs.createReadStream(path.resolve(__dirname, '../../../dist/static/favicon.ico'))).code(200).type('image/x-icon');
                }
            }
        );
    }

    server.route(routes);

    return next();
};



exports.register = function (server, options, next) {
    server.dependency(['vision'], internals.after);
    return next();
};

exports.register.attributes = require('./package.json');
