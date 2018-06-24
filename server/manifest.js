'use strict';

const path = require('path');
const Config = require('./config');

const routePrefix = '/api/v1';

const webManifest = {
    server: {
        // cache: 'redis',
        port: Config.get('/port/api')
    },
    register: {
        plugins: [
            {
                plugin: 'hapi-nuxt',
                options: path.resolve(__dirname, '../nuxt.config.js')
            },
            { plugin: 'inert' },
            { plugin: 'vision' },
            { plugin: './plugins/logger' },
            {
                plugin: './plugins/bookshelf-orm',
                options: {
                    knex: {
                        debug: Config.get('/db/debug')
                    }
                }
            },
            // { plugin: './plugins/auth-scheme-jwt-cookie' },
            { plugin: './plugins/hapi-basic-auth' },
            { plugin: './plugins/core' },
            { plugin: './plugins/customer' },
            { plugin: './plugins/products' },
            {
                plugin: './plugins/shopping-cart',
                routes: {
                    prefix: routePrefix
                }
            },
            {
                plugin: './plugins/shipping',
                routes: {
                    prefix: routePrefix
                }
            }
        ],
        // options: {
        //     once: false
        // }
    }
}

module.exports = webManifest;
