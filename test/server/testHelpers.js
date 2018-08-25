require('dotenv').config();

const Server = require('../../server');
const isObject = require('lodash.isobject');
const queryString = require('query-string');

let cartToken = null;


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
        streetAddress: '215 Clayton St.',
        city: 'San Francisco',
        state: 'CA',
        postalCode: '94117',
        countryCodeAlpha2: 'US',
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
    })
    .catch((err) => {
        console.error("ERROR GETTING JWT", err)
    });
}


async function startServer(manifest, options) {
    return Server.init(manifest, options);
}

async function getServer(manifest, options) {
    return await startServer(manifest, options)
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

    if(isObject(manifest) && Array.isArray(manifest.register.plugins)) {
        manifest.register.plugins.forEach((obj, index) => {
            if(isObject(obj) && obj.plugin === path) {
                i = index;
            }
        })
    }

    return i;
}


function spliceRegistrationFromManifest(path, manifest) {
    let index = getRegistrationIndexFromManifest(path, manifest);
    if(index > -1) {
        manifest.register.plugins.splice(index, 1);
    }
}


async function getProduct(server, paramString) {
    let paramStringDefault = queryString.stringify(
        {
            where: ['is_available', '=', true],
            limit: 1
        },
        { arrayFormat: 'bracket' }
    );

    let apiPrefix = getApiPrefix();

    let { result } = await server.inject({
        method: 'GET',
        url: `${apiPrefix}/products?${paramString || paramStringDefault}`
    });

    let data = JSON.parse(JSON.stringify(result.data));
    return data[0].id;
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
        server: {
            port: 0
        },
        register: {
            plugins: [
                { plugin: 'inert' },
                { plugin: 'vision' },
                { plugin: './plugins/logger' },
                {
                    plugin: './plugins/bookshelf-orm',
                    options: {
                        knex: {
                            debug: false
                        }
                    }
                },
                // { plugin: './plugins/auth-scheme-jwt-cookie' },
                { plugin: './plugins/core' }
            ]
        }
    };

    return manifest;
}


async function addToCart(server, productId, options) {
    let opts = options || {qty: 1, size: 'SIZE_ADULT_3XL'};

    let config = {
        method: 'POST',
        url: '/cart/item/add',
        payload: {
            id: productId,
            options: opts
        }
    };

    let headers = getRequestHeader();

    if(headers) {
        config.headers = headers;
    }

    let response = await server.inject(config);
    setCartToken(response);

    return response;
}


function setCartToken(response) {
    if(isObject(response) && isObject(response.headers) && response.headers['x-cart-token']) {
        cartToken = response.headers['x-cart-token'];
    }
}

function getRequestHeader() {
    if(!cartToken) {
        return;
    }

    return {
        Cookie: `cart_token=${cartToken}`
    }
}


module.exports = {
    destroyKnexAndStopServer,
    getFakeBillingAddress,
    getFakeShippingAddress,
    getBasicManifest,
    startServer,
    getServer,
    startServerAndGetHeaders,
    getRegistrationIndexFromManifest,
    spliceRegistrationFromManifest,
    getProduct,
    addToCart,
    getApiPrefix,
    setCartToken,
    getRequestHeader
}
