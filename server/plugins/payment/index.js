'use strict';

const Joi = require('joi');
const braintree = require('braintree');
const PaymentController = require('./paymentController');


const after = function (server) {
    server.route([
        {
            method: 'GET',
            path: '/payment',
            options: {
                description: 'Returns payment data for a given id',
                validate: {
                    query: {
                        id: Joi.string().max(50),
                    }
                },
                handler: PaymentController.getPaymentHandler
            }
        },
        {
            method: 'GET',
            path: '/payments',
            options: {
                description: 'Gets a list of payments',
                handler: PaymentController.getPaymentsHandler
            }
        },
        {
            method: 'GET',
            path: '/payment/summary',
            options: {
                description: 'Basic transaction results for a given order',
                validate: {
                    query: {
                        id: Joi.string().max(50)
                    }
                },
                handler: PaymentController.getPaymentSummaryHandler
            }
        },
        {
            method: 'POST',
            path: '/payment/shipping/packingslip',
            options: {
                description: 'Creates a packing slip for a given payment ID',
                validate: {
                    payload: Joi.object({
                        id: Joi.string().uuid().required()
                    })
                },
                handler: PaymentController.shippingPackingSlipHandler
            }
        },
        {
            method: 'POST',
            path: '/payment/shipping/label',
            options: {
                description: 'Creates a shipping label for a given payment ID',
                validate: {
                    payload: Joi.object({
                        id: Joi.string().uuid().required(), // payment id
                        shipment: Joi.object().keys({
                            address_from: Joi.object().unknown().required(),
                            address_to: Joi.object().unknown().required(),
                            parcels: Joi.array().required(),
                        }).required(),
                        carrier_account: Joi.string().required(),
                        servicelevel_token: Joi.string().required(),
                        label_file_type: Joi.string().optional(),
                        metadata: Joi.string().optional(),
                    })
                },
                handler: PaymentController.purchaseShippingLabelHandler
            }
        },
        {
            method: 'GET',
            path: '/payment/shipping/label',
            options: {
                description: 'Gets a shipping label for a given payment ID',
                validate: {
                    query: Joi.object({
                        id: Joi.string().uuid().required()
                    })
                },
                handler: PaymentController.getShippingLabelHandler
            }
        },
        {
            method: 'GET',
            path: '/payment/token',
            options: {
                description: 'Returns the Braintree client token',
                handler: PaymentController.getPaymentClientTokenHandler
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
};


exports.plugin = {
    once: true,
    pkg: require('./package.json'),
    register: function (server, options) {
        PaymentController.setServer(server);

        let env;
        if(process.env.NODE_ENV === 'test' || process.env.BRAINTREE_USE_SANDBOX) {
            env = braintree.Environment.Sandbox;
        }
        else {
            env = braintree.Environment.Production;
        }

        global.braintreeGateway = braintree.connect({
            environment: env,
            merchantId: process.env.BRAINTREE_MERCHANT_ID,
            publicKey: process.env.BRAINTREE_PUBLIC_KEY,
            privateKey: process.env.BRAINTREE_PRIVATE_KEY
        });

        server.dependency(['BookshelfOrm', 'Core'], after);
    }
};
