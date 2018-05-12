'use strict';

const Joi = require('joi');
const Hoek = require('hoek');
const Boom = require('boom');
const braintree = require('braintree');
const HelperService = require('../../helpers.service');
const PaymentService = require('./services/PaymentService');

let paymentService;
let internals = {};


internals.after = function (server, next) {

    /************************************
     * ROUTE HANDLERS
     ************************************/

    internals.getOrder = (request, reply) => {
        paymentService
            .getPaymentByAttribute('transaction_id', request.query.transaction_id)
            .then((payment) => {
                if(!payment) {
                    return reply(Boom.notFound('Order not found'));
                }

                let p = payment.toJSON();

                // Much less data can be sent over the wire in this case, 
                // so trimming the transaction value in the response
                let cartResponse = request.query.verbose 
                                    ? p.shoppingCart 
                                    : { num_items: p.shoppingCart.num_items, shipping_email: p.shoppingCart.shipping_email };

                let response = {
                    id: p.id,
                    created: p.created_at,
                    shipping: p.transaction.shipping,
                    shoppingCart: cartResponse,
                    transaction: {
                        id: p.transaction_id,
                        amount: p.transaction.amount,
                        payment: {
                            type: p.transaction.paymentInstrumentType
                        }
                    }
                };

                if(p.transaction.paymentInstrumentType === 'credit_card') {
                    response.transaction.payment.last4 = p.transaction.creditCard.last4;
                    response.transaction.payment.cardType = p.transaction.creditCard.cardType;
                }
                else {
                    response.transaction.payment.payerEmail = p.transaction.paypalAccount.payerEmail;
                }
                
                reply.apiSuccess(response);
            })
            .catch((err) => {
                global.logger.error(err);
                global.bugsnag(err);
                reply(Boom.badRequest(err));
            });
    };


    internals.getOrders = (request, reply) => {
        HelperService
            .fetchPage(
                request, 
                paymentService.getModel(), 
                ['shoppingCart.cart_items.product']
            )
            .then((orders) => {
                reply.apiSuccess(orders, orders.pagination);
            })
            .catch((err) => {
                global.logger.error(err);
                global.bugsnag(err);
                reply(Boom.notFound(err));
            });
    };


    server.route([
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
                handler: internals.getOrder
            }
        },
        {
            method: 'GET',
            path: '/orders',
            config: {
                description: 'Gets a list of orders',
                handler: internals.getOrders
            }
        }
    ]);


    // LOADING BOOKSHELF MODEL:
    // let baseModel = bookshelf.Model.extend({});
    let baseModel = require('bookshelf-modelbase')(server.app.bookshelf);

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

    paymentService = new PaymentService(server);

    const settings = Hoek.applyToDefaults({ isSandbox: true }, options);

    global.braintreeGateway = braintree.connect({
        environment: settings.isSandbox ? braintree.Environment.Sandbox : braintree.Environment.Production,
        merchantId: settings.merchantId,
        publicKey: settings.publicKey,
        privateKey: settings.privateKey
    });

    server.dependency(['BookshelfOrm'], internals.after);

    return next();
};

exports.register.attributes = require('./package.json');