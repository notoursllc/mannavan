'use strict';

const Joi = require('joi');
const Boom = require('boom');
const cloneDeep = require('lodash.clonedeep');
const PaymentService = require('../payments/services/PaymentService');
const ShoppingCartService = require('./services/ShoppingCartService');
const ShoppingCartItemService = require('./services/ShoppingCartItemService');
const ShoppingCartEmailService = require('./services/ShoppingCartEmailService');
const SalesTaxService = require('./services/SalesTaxService');

let internals = {};


internals.after = function (server, next) {

    let shoppingCartService = new ShoppingCartService(server);
    let shoppingCartItemService = new ShoppingCartItemService(server);
    let paymentService = new PaymentService(server);
    let shoppingCartEmailService = new ShoppingCartEmailService();
    let salesTaxService = new SalesTaxService();

    /*
    // using jwt to validate cart token
    server.register(require('hapi-auth-jwt2'));

    const validateJwt = (decoded, request, cb) => {
        // for now no other validation is needed
        cb(null, true);
    }

    // setting the 3rd argument to true means 'mode' is 'required'
    // see: http://hapijs.com/tutorials/auth#mode
    // server.auth.strategy('jwt', 'jwt', true, {
    server.auth.strategy('xCartToken', 'jwt', {
        key: process.env.JWT_SERVER_SECRET,
        headerKey: 'x-cart-token',
        // headerKey: false,
        // urlKey: false,
        // cookieKey: 'token',
        validateFunc: validateJwt,
        verifyOptions: {   // https://github.com/auth0/node-jsonwebtoken#jwtverifytoken-secretorpublickey-options-callback
            // ignoreExpiration: true,    // do not reject expired tokens
            algorithms: [ 'HS256' ]
        }
    });
    */

//    server.register(require('../auth-scheme-jwt-cookie'));

//    server.auth.strategy('xCartToken', 'jwt-cookie', {
//         secret: process.env.JWT_SERVER_SECRET,
//         cookieKey: 'cart-jwt',
//         verifyOptions: {   // https://github.com/auth0/node-jsonwebtoken#jwtverifytoken-secretorpublickey-options-callback
//             ignoreExpiration: true,    // do not reject expired tokens
//             algorithms: [ 'HS256' ]
//         }
//     });

//     server.auth.default('xCartToken')


    /************************************
     * ROUTE HANDLERS
     ************************************/

    internals.cartClientTokenGet = (request, reply) => {
        shoppingCartService
            .getCartClientToken()
            .then((token) => {
                reply().header("Authorization", token);
            })
            .catch((err) => {
                reply(Boom.badData(err));
            });
    };


    internals.cartPaymentTokenGet = (request, reply) => {
        paymentService
            .getClientToken()
            .then((token) => {
                reply.apiSuccess(token);
            })
            .catch((err) => {
                reply(Boom.badData(err));
            });
    };


    internals.cartGet = (request, reply) => {
        shoppingCartService.findOrCreateCart(request)
            .then((ShoppingCart) => {
                reply.apiSuccess(ShoppingCart.toJSON());
            })
            .catch((err) => {
                reply(Boom.notFound(err));
            });
    };


    internals.cartAddresses = (request, reply) => {
        shoppingCartService.findOrCreateCart(request)
            .then((ShoppingCart) => {
                reply.apiSuccess(ShoppingCart.toJSON());
            })
            .catch((err) => {
                reply(Boom.notFound(err));
            });
    };


    internals.cartItemAdd = (request, reply) => {
        shoppingCartItemService
            .addItem(request)
            .then(() => {
                return shoppingCartService.getCart(request);
            })
            .then((ShoppingCart) => {
                if(!ShoppingCart) {
                    throw new Error("Error getting the shopping cart");
                }
                reply.apiSuccess(ShoppingCart.toJSON());
            })
            .catch((err) => {
                reply(Boom.badData(err));
            });
    };


    internals.cartItemRemove = (request, reply) => {
        shoppingCartService
            .getCart(request)
            .then((ShoppingCart) => {
                return shoppingCartItemService
                    .getModel()
                    .findById(request.payload.id)
                    .then((ShoppingCartItem) => {
                        if(!ShoppingCartItem) {
                            return;
                        }

                        return ShoppingCartItem.destroy();
                    });
            })
            .then(() => {
                return shoppingCartService.getCart(request);
            })
            .then((ShoppingCart) => {
                reply.apiSuccess(ShoppingCart.toJSON());
            })
            .catch((err) => {
                reply(Boom.badData(err));
            });
    };


    internals.cartItemQty = (request, reply) => {
        // console.log("GET CART COOKIE TOKEN?", request.state['cart-jwt']);

        shoppingCartService
            .getCart(request)
            .then((ShoppingCart) => {
                return shoppingCartItemService.getModel().findById(request.payload.id);
            })
            .then((ShoppingCartItem) => {
                if(!ShoppingCartItem) {
                    throw new Error(`Unable to find a shopping cart item.`);
                }

                return ShoppingCartItem.save(
                    { qty: parseInt((request.payload.qty || 1), 10) },
                    { method: 'update', patch: true }
                );
            })
            .then(() => {
                return shoppingCartService.getCart(request)
            })
            .then((ShoppingCart) => {
                reply.apiSuccess(ShoppingCart.toJSON());
            })
            .catch((err) => {
                reply(Boom.badData(err));
            });
    };


    internals.cartShippingSetAddress = (request, reply) => {
        shoppingCartService
            .getCart(request)
            .then((ShoppingCart) => {
                let salesTaxParams = cloneDeep(request.payload);
                salesTaxParams.sub_total = ShoppingCart.sub_total

                return salesTaxService
                    .getSalesTaxAmount(salesTaxParams)
                    .then((salesTax) => {
                        // Save the shipping params and the sales tax value in the model
                        let updateParams = request.payload;
                        updateParams.sales_tax = salesTax;

                        return ShoppingCart.save(
                            updateParams,
                            { method: 'update', patch: true }
                        );
                    });
            })
            .then((ShoppingCart) => {
                reply.apiSuccess(ShoppingCart.toJSON());
            })
            .catch((err) => {
                reply(Boom.badData(err));
            });
    };


    internals.cartShippingRate = (request, reply) => {
        shoppingCartService
            .getCart(request)
            .then((ShoppingCart) => {
                return ShoppingCart.save(
                    request.payload,
                    { method: 'update', patch: true }
                );
            })
            .then((ShoppingCart) => {
                reply.apiSuccess(ShoppingCart.toJSON());
            })
            .catch((err) => {
                reply(Boom.badData(err));
            });
    };


    internals.cartCheckout = (request, reply) => {
        let cartJson;
        let cart;

        shoppingCartService
            .getCart(request)
            .then((ShoppingCart) => {
                cart = ShoppingCart;
                cartJson = ShoppingCart.toJSON();

                return paymentService.runPayment({
                    paymentMethodNonce: request.payload.nonce,
                    amount: ShoppingCart.get('grand_total'),
                    customer: {
                        // NOTE: Braintree requires that this email has a '.' in the domain name (i.e test@test.com)
                        // which technically isn't correct. This fails validation: test@test
                        email: cartJson.shipping_email
                    },
                    shipping: {
                        company: cartJson.shipping_company,
                        countryCodeAlpha2: cartJson.shipping_countryCodeAlpha2,
                        extendedAddress: cartJson.shipping_extendedAddress || null,
                        firstName: cartJson.shipping_firstName,
                        lastName: cartJson.shipping_lastName,
                        locality: cartJson.shipping_city,
                        postalCode: cartJson.shipping_postalCode,
                        region: cartJson.shipping_state,
                        streetAddress: cartJson.shipping_streetAddress
                    },
                    billing: {
                        company: request.payload.billing_company,
                        countryCodeAlpha2: request.payload.billing_countryCodeAlpha2,
                        extendedAddress: request.payload.billing_extendedAddress || null,
                        firstName: request.payload.billing_firstName,
                        lastName: request.payload.billing_lastName,
                        locality: request.payload.billing_city,
                        postalCode: request.payload.billing_postalCode,
                        region: request.payload.billing_state,
                        streetAddress: request.payload.billing_streetAddress
                    },
                    options: {
                        submitForSettlement: true
                    }
                });
            })
            .then((transactionObj) => {
                console.log('BRAINTREE TRANSACTION RESULT', transactionObj)

                shoppingCartEmailService
                    .sendPurchaseEmails(cart, transactionObj.transaction.id)
                    .catch((err) => {
                        let cartId = cart.get('id');
                        let msg = `Unable to send email confirmation to user after successful purchase: (ShoppingCart ID: ${cartId}) ${err}`;
                        global.logger.error(msg);
                        global.bugsnag(msg);
                    });

                // If the Braintree transaction is successful then anything that happens after this
                // (i.e saving the payment details to DB) needs to fail silently, as the user has
                // already been changed and we can't give the impression of an overall transaction
                // failure that may prompt them to re-do the purchase.

                // Saving the payment transaction whether it was successful (transactionObj.success === true)
                // or not (transactionObj.success === false)
                // Any failures that happen while saving the payment info do not affect the
                // braintree transaction and thus should fail silently.
                paymentService
                    .savePayment(cartJson.id, transactionObj)
                    .catch((err) => {
                        let msg = `ERROR SAVING PAYMENT INFO: ${err}`;
                        // Catching the error here and not letting it fall through
                        // to the catch block below because we do not want this
                        // failure returning in the API response.  It will be logged only.
                        global.logger.error(msg)
                        global.bugsnag(msg);
                    });


                // Updating the cart with the billing params and the 'closed_at'
                // timestamp if transaction was successful:
                let updateParams = cloneDeep(request.payload);
                delete updateParams.nonce;
                if(transactionObj.success) {
                    // This will cause the cart not to be re-used
                    // (See ShoppingCart -> getCart())
                    updateParams.closed_at = new Date()
                }

                cart.save(
                    updateParams,
                    { method: 'update', patch: true }
                )
                .catch((err) => {
                    global.logger.error(err);
                    global.bugsnag(err);
                });


                // Successful transactions return the transaction id
                if(transactionObj.success) {
                    reply.apiSuccess({
                        transactionId: transactionObj.transaction.id
                    });
                }
                else {
                    throw new Error(transactionObj.message || 'An error occurred when saving the payment transaction data.')
                }
            })
            .catch((err) => {
                let msg = err instanceof Error ? err.message : err;
                // NOTE: Boom errors are automatically logged by the onPreResponse handler
                reply(Boom.badData(msg));
            });
    };


    server.route([
        {
            method: 'GET',
            path: '/cart/client-token/get',
            config: {
                auth: false,
                description: 'Returns the client token',
                handler: internals.cartClientTokenGet
            }
        },
        {
            method: 'GET',
            path: '/cart/payment-token/get',
            config: {
                description: 'Returns the Braintree client token',
                auth: {
                    strategies: ['xCartToken']
                },
                handler: internals.cartPaymentTokenGet
            }
        },
        {
            method: 'GET',
            path: '/cart/get',
            config: {
                description: 'Finds the cart for the given jwt user',
                auth: {
                    strategies: ['xCartToken']
                },
                handler: internals.cartGet
            }
        },
        {
            method: 'POST',
            path: '/cart/addresses',
            config: {
                description: 'Finds the cart for the given jwt user',
                auth: {
                    strategies: ['xCartToken']
                },
                validate: {
                    payload: Joi.object({
                        id: Joi.string().uuid().required()
                    })
                },
                handler: internals.cartAddresses
            }
        },
        {
            method: 'POST',
            path: '/cart/item/add',
            config: {
                description: 'Adds a new item to the cart',
                auth: {
                    strategies: ['xCartToken']
                },
                validate: {
                    payload: Joi.object({
                        id: Joi.string().uuid().required(),
                        options: Joi.object({
                            size: Joi.string().uppercase().min(6), // 'SIZE_?'
                            qty: Joi.number().min(1).required()
                        }).required()
                    })
                },
                handler: internals.cartItemAdd
            }
        },
        {
            method: 'POST',
            path: '/cart/item/remove',
            config: {
                description: 'Removes an item from the cart',
                auth: {
                    strategies: ['xCartToken']
                },
                validate: {
                    payload: {
                        id: Joi.string().uuid().required()
                    }
                },
                handler: internals.cartItemRemove
            }
        },
        {
            method: 'POST',
            path: '/cart/item/qty',
            config: {
                description: 'Updates the quantity of a shopping cart item (ShoppingCartItem model)',
                auth: {
                    strategies: ['xCartToken']
                },
                validate: {
                    payload: Joi.object({
                        id: Joi.string().uuid().required(),  // cart item id
                        qty: Joi.number().min(1).required()
                    })
                },
                handler: internals.cartItemQty
            }
        },
        {
            method: 'POST',
            path: '/cart/shipping/setaddress',
            config: {
                description: 'Sets the shipping address for the cart and calculates the sales tax',
                auth: {
                    strategies: ['xCartToken']
                },
                validate: {
                    payload: Joi.reach(shoppingCartService.getShoppingCartModelSchema(), 'shipping')
                },
                handler: internals.cartShippingSetAddress
            }
        },
        {
            method: 'POST',
            path: '/cart/shipping/rate',
            config: {
                description: 'Sets the selected shipping rate for the cart',
                auth: {
                    strategies: ['xCartToken']
                },
                validate: {
                    payload: Joi.reach(shoppingCartService.getShoppingCartModelSchema(), 'shipping_rate')
                },
                handler: internals.cartShippingRate
            }
        },
        {
            method: 'POST',
            path: '/cart/checkout',
            config: {
                description: 'Braintree nonce received by the client. Complete the transaction',
                auth: {
                    strategies: ['xCartToken']
                },
                validate: {
                    // NOTE: shipping is not required here because the 'cart/shipping/setaddress' route
                    // should have been called before this route, which persists the shipping info.
                    payload: Object.assign(
                        {},
                        { nonce: Joi.string().trim().required() },
                        shoppingCartService.getBillingAttributesSchema()
                    )
                },
                handler: internals.cartCheckout
            }
        },
        {
            method: 'GET',
            path: '/cart/{param*}',
            config: {
                description: 'Returns 404 response',
                handler: (request, reply) => {
                    reply(Boom.notFound());
                }
            }
        }
    ]);


    // LOADING BOOKSHELF MODEL:
    let baseModel = require('bookshelf-modelbase')(server.app.bookshelf);

    server.app.bookshelf.model(
        'ShoppingCart',
        require('./models/ShoppingCart')(baseModel, server.app.bookshelf, server)
    );

    server.app.bookshelf.model(
        'ShoppingCartItem',
        require('./models/ShoppingCartItem')(baseModel, server.app.bookshelf, server)
    );

    return next();
};



exports.register = (server, options, next) => {
    server.dependency(['BookshelfOrm', 'Core', 'Products', 'Payments'], internals.after);
    return next();
};

exports.register.attributes = require('./package.json');
