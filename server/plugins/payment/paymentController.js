'use strict';

const Joi = require('joi');
const Boom = require('boom');
const isObject = require('lodash.isobject');
const HelperService = require('../../helpers.service');
const cartController = require('../shopping-cart/shoppingCartController')
const shippoOrdersAPI = require('../shipping/shippoAPI/orders');
const shippoTransactionsAPI = require('../shipping/shippoAPI/transactions');
let server = null;


function getPaymentModel() {
    return server.app.bookshelf.model('Payment');
}


function setServer(s) {
    server = s;
}


/**
 * Gets a payment by a given attribute
 *
 * @param attrName
 * @param attrValue
 * @param withRelatedArr
 */
async function getPaymentByAttribute(attrName, attrValue, withRelatedArr) {
    let fetchObj = null;

    if(Array.isArray(withRelatedArr)) {
        fetchObj = {
            withRelated: withRelatedArr   // example: 'shoppingCart.cart_items.product' // https://stackoverflow.com/questions/35679855/always-fetch-from-related-models-in-bookshelf-js#35841710
        }
    }

    const Payment = await getPaymentModel().query((qb) => {
        qb.where(attrName, '=', attrValue);  // TODO: Is there a SQL injection risk here?
    })
    .fetch(fetchObj);

    global.logger.debug("PAYMENT BY ATTRIBUTE", attrName, attrValue, (Payment ? Payment.toJSON() : ''));

    return Payment;
}


/**
 * Persists some of the Braintree transaction data
 *
 * Since the Braintree API allows searching for transaction data (https://developers.braintreepayments.com/reference/general/searching/search-fields/node)
 * it seems redundant and perhaps a bit insecure to store the entire transaction JSON here as well.
 * Therefore, pulling out only a few relevant transaction attributes (most importantly the transaction id)
 * and persisting those only.
 *
 * @param cart_id
 * @param transactionJson
 * @returns {Promise}
 */
async function savePayment(cart_id, transactionJson) {
    global.logger.debug("SAVE PAYMENT - TRANSACTION", transactionJson);

    if(!isObject(transactionJson) || !isObject(transactionJson.transaction)) {
        throw new Error('An error occurred while processing the transaction: transactionJson.transaction is not an object');
    }

    const Payment = await getPaymentModel().forge().save(
        {
            cart_id: cart_id,
            transaction: transactionJson.transaction,
        },
        { method: 'insert' }
    );

    global.logger.debug("SAVE PAYMENT RESULT", Payment ? Payment.toJSON() : Payment)
    return Payment;
}


async function getPaymentsHandler(request, h) {
    try {
        const payments = await HelperService.fetchPage(
            request,
            getPaymentModel(),
            ['shoppingCart.cart_items.product']
        );

        return h.apiSuccess(
            payments, payments.pagination
        );
    }
    catch(err) {
        global.logger.error(err);
        global.bugsnag(err);
        throw Boom.notFound(err);
    }
}


async function getPaymentSummaryHandler(request, h) {
    try {
        const Payment = await getPaymentByAttribute(
            'id',
            request.query.id,
            ['shoppingCart.cart_items.product']
        );

        if(!Payment) {
            throw Boom.notFound('Payment not found');
        }

        let p = Payment.toJSON();

        let response = {
            id: p.id,
            created: p.created_at,
            shipping: p.transaction.shipping,
            shoppingCart: {
                num_items: p.shoppingCart.num_items,
                shipping_email: p.shoppingCart.shipping_email
            },
            transaction: {
                id: p.transaction.id,
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

        return h.apiSuccess(response);
    }
    catch(err) {
        global.logger.error(err);
        global.bugsnag(err);
        throw Boom.badRequest(err);
    }
}


async function getPaymentHandler(request, h) {
    try {
        const Payment = await getPaymentByAttribute(
            'id',
            request.query.id,
            ['shoppingCart.cart_items.product.pics']
        );

        if(!Payment) {
            throw Boom.notFound('Payment not found');
        }

        return h.apiSuccess(
            Payment.toJSON()
        );
    }
    catch(err) {
        global.logger.error(err);
        global.bugsnag(err);
        throw Boom.notFound(err);
    }
}


/**
 * Creates a Shippo "Packing Slip" by Payment ID
 *
 * @param {*} request
 * @param {*} h
 */
async function shippingPackingSlipHandler(request, h) {
    try {
        let packingSlip;
        const Payment = await getPaymentByAttribute(
            'id',
            request.payload.id,
            ['shoppingCart.cart_items.product']
        );

        if(!Payment) {
            throw new Error('Payment does not exist.')
        }

        // If we already have the shippo_order_id then just need to
        // call the Shippo API to return the packing slip
        if(Payment.get('shippo_order_id')) {
            packingSlip = await shippoOrdersAPI.getPackingSlipForOrder(Payment.get('shippo_order_id'));
        }
        else {
            // We dont have an shippo_order_id yet:
            const ShoppingCart = await cartController.getCartByAttribute(
                'id',
                Payment.get('cart_id'),
                cartController.getDefaultWithRelated()
            );

            if(!ShoppingCart) {
                throw new Error('Shopping cart does not exist.')
            }

            const shippoOrder = await cartController.createShippoOrderFromShoppingCart(ShoppingCart);

            // no need to await here:
            Payment.save(
                { shippo_order_id: shippoOrder.object_id },
                { method: 'update', patch: true }
            );

            packingSlip = await shippoOrdersAPI.getPackingSlipForOrder(shippoOrder.object_id);
        }

        return h.apiSuccess(
            packingSlip
        );
    }
    catch(err) {
        global.logger.error(err);
        global.bugsnag(err);
        throw Boom.badRequest(err);
    }
}


/**
 * Purchases a Shipping Label from Shippo, by Payment ID
 *
 * @param {*} request
 * @param {*} h
 */
async function purchaseShippingLabelHandler(request, h) {
    try {
        const Payment = await getPaymentByAttribute(
            'id',
            request.payload.id,
        );

        if(!Payment) {
            throw new Error('Payment does not exist.')
        }

        delete request.payload.id;

        const response = await shippoTransactionsAPI.createShippingLabel(request.payload);
        global.logger.debug('CREATE SHIPPING LABEL RESPONSE', response);

        // no need to await here:
        Payment.save(
            { shippo_transaction_id: response.object_id },
            { method: 'update', patch: true }
        );

        return h.apiSuccess(
            response
        );
    }
    catch(err) {
        global.logger.error(err);
        global.bugsnag(err);
        throw Boom.badRequest(err);
    }
}


/**
 * Purchases a Shipping Label from Shippo, by Payment ID
 *
 * @param {*} request
 * @param {*} h
 */
async function getShippingLabelHandler(request, h) {
    try {
        const response = await shippoTransactionsAPI.getShippingLabel(request.query.id);
        global.logger.debug('GET SHIPPING LABEL RESPONSE', response);

        return h.apiSuccess(
            response
        );
    }
    catch(err) {
        global.logger.error(err);
        global.bugsnag(err);
        throw Boom.badRequest(err);
    }
}

/**
 * Deletes a Shipping Label
 *
 * @param {*} request
 * @param {*} h
 */
async function deleteShippingLabelHandler(request, h) {
    try {
        const Payment = await getPaymentByAttribute(
            'id',
            request.query.id,
        );

        if(!Payment) {
            throw new Error('Payment does not exist.')
        }

        // NOTE: Shippo does not have an API endpoint to delete a transaction
        // document, so the best we can do is to delete the 'shippo_transaction_id'
        // value so a new transaction can be created.

        // no need to await here:
        Payment.save(
            { shippo_transaction_id: null },
            { method: 'update', patch: true }
        );

        return h.apiSuccess({
            id: request.query.id
        });
    }
    catch(err) {
        global.logger.error(err);
        global.bugsnag(err);
        throw Boom.badRequest(err);
    }
}


/**
 * Submits a payment 'sale' to Braintree
 *
 * @param opts  Options object to pass to braintree.transaction.sale
 * @returns {Promise}
 */
async function runPayment(opts) {
    let schema = Joi.object().keys({
        paymentMethodNonce: Joi.string().trim().required(),
        amount: Joi.number().precision(2).positive().required(),
        shipping: Joi.object().unknown().required(),
        customer: Joi.object().unknown(),
        billing: Joi.object().unknown(),
        options: Joi.object().unknown()
    });

    const validateResult = schema.validate(opts);
    if (validateResult.error) {
        throw new Error(validateResult.error);
    }

    const result = await global.braintreeGateway.transaction.sale(opts);

    if (result.success) {
        return result
    }

    throw new Error(result.message);
}


/**
* From Braintree docs:
* "A client token is a signed data blob that includes configuration and authorization information
* required by the Braintree Client SDK. These should not be reused; a new client token should be
* generated for each customer request that's sent to Braintree.
* For security, we will revoke client tokens if they are reused excessively within a short time period."
*
* https://developers.braintreepayments.com/start/overview
* https://developers.braintreepayments.com/reference/request/client-token/generate/node
*
* @returns {Promise}
*/
async function getPaymentClientTokenHandler(request, h) {
    try {
        // just verifyig that a shopping cart exists for this user.
        // If not, no need to generate the token
        let ShoppingCart = await cartController.getActiveCart(
            cartController.getValidCartTokenFromRequest(request)
        );

        if(!ShoppingCart) {
            throw new Error('Shopping cart does not exist.')
        }

        const response = await global.braintreeGateway.clientToken.generate({});

        if(!response.clientToken) {
            throw new Error('Error generating payment token.')
        }

        return h.apiSuccess(
            response.clientToken
        );
    }
    catch(err) {
        global.logger.error(err);
        global.bugsnag(err);
        throw Boom.badRequest(err);
    }
}

module.exports = {
    setServer,
    getPaymentByAttribute,
    savePayment,
    runPayment,

    // route handlers
    getPaymentsHandler,
    getPaymentSummaryHandler,
    getPaymentHandler,
    getPaymentClientTokenHandler,
    shippingPackingSlipHandler,
    purchaseShippingLabelHandler,
    getShippingLabelHandler,
    deleteShippingLabelHandler
}
