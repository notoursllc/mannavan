const path = require('path');
const Joi = require('joi');
const isObject = require('lodash.isobject');
const coreController = require('./coreController');

let internals = {};


internals.after = (server, next) => {

    let routes = [
        {
            method: 'GET',
            path: '/api/v1/jwt',
            config: {
                auth: false,
                description: 'Returns the client token',
                handler: coreController.getClientJwtHandler
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
                handler: coreController.loggerHandler
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
                handler: coreController.faviconHandler
            }
        );
    }

    server.route(routes);

    return next();
};



exports.register = function (server, options, next) {
    coreController.setServer(server);

    // Route authentication
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


    server.dependency(['vision'], internals.after);
    return next();
};

exports.register.attributes = require('./package.json');
