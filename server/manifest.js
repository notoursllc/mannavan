'use strict';

const Config = require('./config');

let internals = {};

internals.manifest = {
    connections: [
        // {
        //     host: 'localhost',
        //     port: Config.get('/port/web'),
        //     labels: ['web']
        // },
        {
            port: Config.get('/port/api'),
            labels: ['api'],
            routes: {
                // cors: false,
                cors: {
                    origin: ['*'],
                    headers: ['Accept', 'Authorization', 'Content-Type', 'If-None-Match']
                }
                // security: {
                //     hsts: true,
                //     xframe: true,
                //     xss: true,
                //     noOpen: true,
                //     noSniff: true
                // }
            }
        }
    ],

    registrations: [
        {
            plugin: 'hapi-nuxt'
        },
        {
            plugin: 'inert'
        },
        {
            plugin: 'vision'
        },
        {
            plugin: {
                register: './plugins/logger'
            }
        },
        {
            plugin: {
                register: './plugins/bookshelf-orm',
                options: {
                    knex: {
                        debug: Config.get('/db/debug')
                    },
                    plugins: [
                        require('bookshelf-uuid')
                    ]
                }
            }
        },
        {
            plugin: {
                register: './plugins/core'
            },
            options: {
                select: ['api']
            }
        },
        {
            plugin: {
                register: './plugins/customer'
            }
        },
        {
            plugin: {
                register: './plugins/products'
            },
            options: {
                select: ['api']
                // NOTE: not setting the routes.prefix value here
                // because I set it conditionally in the plugin route code
            }
        },
        {
            plugin: {
                register: './plugins/shopping-cart',
                options: {
                    isSandbox: process.env.BRAINTREE_ENVIRONMENT === 'Environment.SANDBOX',
                    merchantId: process.env.BRAINTREE_MERCHANT_ID,
                    publicKey: process.env.BRAINTREE_PUBLIC_KEY,
                    privateKey: process.env.BRAINTREE_PRIVATE_KEY
                }
            },
            options: {
                select: ['api'],
                routes: {
                    prefix: '/api/v1'
                }
            }
        },
        {
            plugin: {
                register: './plugins/shipping'
            },
            options: {
                select: ['api'],
                routes: {
                    prefix: '/api/v1'
                }
            }
        }
    ]
};


module.exports = internals.manifest;
