require('dotenv').config();

const Server = require('../../server');
const isObject = require('lodash.isobject');
const forEach = require('lodash.foreach');
const queryString = require('query-string');


function destroyKnexAndStopServer(server, done) {
    if(server.app.hasOwnProperty('knex')) {
        server.app.knex.destroy(() => {
            server.stop(done);
        });
    }
    else {
        server.stop(done);
    }
}


function getFakeBillingAddress() {
    let fakeShipping = getFakeShippingAddress();
    delete fakeShipping.email;
    fakeShipping.phone = '123-456-7890';

    return fakeShipping;
}


function getFakeShippingAddress() {
    return {
        firstName: 'wayne',
        lastName: 'gretzky',
        company: 'Edmonton Oilers',
        streetAddress: '123 abc st',
        city: 'Edmonton',
        state: 'Alberta',
        postalCode: '12345',
        countryCodeAlpha2: 'CA',
        email: 'greg@greg.com'
    }
}


function setCartCookie(server, callback) {
    const request = {
        method: 'GET',
        url: getApiPrefix('/jwt')
    };

    server.inject(request, (res) => {
        server.state('cart-jwt', {
            ttl: 24 * 60 * 60 * 1000,     // One day
            isSecure: false,
            isHttpOnly: true,
            encoding: 'base64json',
            clearInvalid: false,
            strictHeader: true
         });

        request.state['cart-jwt'] = res.headers.authorization
        console.log("CART_JWT COOKIE VALUE", request.state['cart-jwt']);

        callback();
    });
}


function getJwtHeaders(server, callback) {
    server.inject({
        method: 'GET',
        url: getApiPrefix('/jwt')
    })
    .then((res) => {
        let headers = {
            cookie: 'cart-jwt=' + res.headers.authorization
        };
        callback(headers);
    });
}


function startServerAndGetHeaders(manifest, composeOptions) {
    // Mocking the appInsightsClient object
    global.appInsightsClient = {
        trackException: (err) => {
            console.log('CAUGHT ERROR', err)
        }
    };

    return new Promise((resolve, reject) => {
        Server.init(manifest, composeOptions, (err, server) => {
            if(err) {
                resolve({
                    err,
                    server
                });
                return;
            }

            getJwtHeaders(server, (headers) => {
                resolve({
                    err,
                    server,
                    headers
                });
            });
        });
    });
}


function getRegistrationIndexFromManifest(path, manifest) {
    let i = -1;

    if(isObject(manifest) && Array.isArray(manifest.registrations)) {
        forEach(manifest.registrations, (obj, index) => {
            if(isObject(obj) && isObject(obj.plugin) && obj.plugin.register === path) {
                i = index;
            }
        })
    }

    return i;
}


function spliceRegistrationFromManifest(path, manifest) {
    let index = getRegistrationIndexFromManifest(path, manifest);

    if(index > -1) {
        manifest.registrations.splice(index, 1);
    }
}


function getProduct(server, headers, paramString) {
    let paramStringDefault = queryString.stringify(
        {
            where: ['is_available', '=', true],
            limit: 1
        },
        { arrayFormat: 'bracket' }
    );

    let apiPrefix = getApiPrefix();

    return server.inject({
        method: 'GET',
        url: `${apiPrefix}/products?${paramString || paramStringDefault}`,
        headers
    })
    .then((res) => {
        let data = JSON.parse(JSON.stringify(res.result.data));
        return data[0].id;
    });
}


function addToCart(server, headers, productId, options) {
    let opts = options || {qty: 1, size: 'SIZE_ADULT_3XL'};

    return server.inject({
        method: 'POST',
        url: '/cart/item/add',
        headers,
        payload: {
            id: productId,
            options: opts
        }
    });
}


function getApiPrefix(path) {
    const prefix = '/api/v1';
    const suffix = path && path.charAt(0) === '/' ? path : '/' + path;

    if(path) {
        return `${prefix}${suffix}`;
    }

    return prefix;
}


function getBasicManifest() {
    let manifest = {
        connections: [
            {
                port: 0
            }
        ],
        registrations: [
            // {
            //     plugin: {
            //         register: './plugins/yar',
            //         options: {}
            //     }
            // },
            // {
            //     plugin: {
            //         register: './plugins/crumbCsrf',
            //         options: {}
            //     }
            // },
            {
                plugin: {
                    register: 'inert'
                }
            },
            {
                plugin: {
                    register: 'vision'
                }
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
                            debug: false
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
                }
            }
        ]
    };

    return manifest;
}


module.exports.destroyKnexAndStopServer = destroyKnexAndStopServer;
module.exports.getFakeBillingAddress = getFakeBillingAddress;
module.exports.getFakeShippingAddress = getFakeShippingAddress;
module.exports.getBasicManifest = getBasicManifest;
module.exports.startServerAndGetHeaders = startServerAndGetHeaders;
module.exports.getRegistrationIndexFromManifest = getRegistrationIndexFromManifest;
module.exports.spliceRegistrationFromManifest = spliceRegistrationFromManifest;
module.exports.getProduct = getProduct;
module.exports.addToCart = addToCart;
module.exports.getApiPrefix = getApiPrefix;
