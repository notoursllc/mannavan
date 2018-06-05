'use strict';

const Joi = require('joi');
const Hoek = require('hoek');
const Boom = require('boom');
const braintree = require('braintree');
const ShoppingCartController = require('./shoppingCartController');


let internals = {};


internals.after = function (server, next) {
    server.route([
        {
            method: 'GET',
            path: '/cart/get',
            config: {
                description: 'Finds the cart for the given jwt user',
                auth: {
                    strategies: ['xCartToken']
                },
                handler: ShoppingCartController.cartGetHandler
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
                handler: ShoppingCartController.cartItemAddHandler
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
                handler: ShoppingCartController.cartItemRemoveHandler
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
                handler: ShoppingCartController.cartItemQtyHandler
            }
        },
        {
            method: 'POST',
            path: '/cart/shipping/address',
            config: {
                description: 'Sets the shipping address for the cart and calculates the sales tax',
                auth: {
                    strategies: ['xCartToken']
                },
                validate: {
                    payload: Joi.reach(ShoppingCartController.getShoppingCartModelSchema(), 'shipping')
                },
                handler: ShoppingCartController.cartShippingSetAddressHandler
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
                    payload: Joi.reach(ShoppingCartController.getShoppingCartModelSchema(), 'shipping_rate')
                },
                handler: ShoppingCartController.genericCartUpdateHandler
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
                    // NOTE: shipping is not required here because the 'cart/shipping/address' route
                    // should have been called before this route, which persists the shipping info.
                    payload: Object.assign(
                        {},
                        { nonce: Joi.string().trim().required() },
                        ShoppingCartController.getBillingAttributesSchema()
                    )
                },
                handler: ShoppingCartController.cartCheckoutHandler
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
        },
        {
            method: 'GET',
            path: '/order',
            config: {
                description: 'Basic order info',
                validate: {
                    query: {
                        transaction_id: Joi.string().max(50),
                        verbose: Joi.boolean().optional()
                    }
                },
                handler: ShoppingCartController.getOrderHandler
            }
        },
        {
            method: 'GET',
            path: '/orders',
            config: {
                description: 'Gets a list of orders',
                handler: ShoppingCartController.getOrdersHandler
            }
        },
        {
            method: 'GET',
            path: '/payment-token',
            config: {
                description: 'Returns the Braintree client token',
                auth: {
                    strategies: ['xCartToken']
                },
                handler: ShoppingCartController.getPaymentClientTokenHandler
            }
        },
    ]);


    // LOADING BOOKSHELF MODEL:
    // let baseModel = bookshelf.Model.extend({});
    let baseModel = require('bookshelf-modelbase')(server.app.bookshelf);

    server.app.bookshelf.model(
        'ShoppingCart',
        require('./models/ShoppingCart')(baseModel, server.app.bookshelf, server)
    );

    server.app.bookshelf.model(
        'ShoppingCartItem',
        require('./models/ShoppingCartItem')(baseModel, server.app.bookshelf, server)
    );

    server.app.bookshelf.model(
        'Payment',
        require('./models/Payment')(baseModel, server.app.bookshelf, server)
    );

    return next();
};



exports.register = (server, options, next) => {
    let schema = Joi.object().keys({
        isSandbox: Joi.boolean(),
        merchantId: Joi.string().alphanum(),
        publicKey: Joi.string().alphanum(),
        privateKey: Joi.string().alphanum()
    });

    const validateOptions = schema.validate(options);
    if (validateOptions.error) {
        return next(validateOptions.error);
    }

    ShoppingCartController.setServer(server);

    const settings = Hoek.applyToDefaults({ isSandbox: true }, options);

    global.braintreeGateway = braintree.connect({
        environment: settings.isSandbox ? braintree.Environment.Sandbox : braintree.Environment.Production,
        merchantId: settings.merchantId,
        publicKey: settings.publicKey,
        privateKey: settings.privateKey
    });


    server.dependency(['BookshelfOrm', 'Core', 'Products'], internals.after);
    return next();
};

exports.register.attributes = require('./package.json');
