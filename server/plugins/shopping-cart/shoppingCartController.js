'use strict';
const Joi = require('joi');
const Boom = require('boom');
const jwt = require('jsonwebtoken');
const uuidV4 = require('uuid/v4');
const cloneDeep = require('lodash.clonedeep');
const isObject = require('lodash.isobject');
const HelperService = require('../../helpers.service');
const salesTaxService = require('./services/SalesTaxService');
const shoppingCartEmailService = require('./services/ShoppingCartEmailService');
const productsController = require('../products/productsController')

let server = null;


function getShoppingCartModel() {
    return server.app.bookshelf.model('ShoppingCart');
}


function getShoppingCartItemModel() {
    return server.app.bookshelf.model('ShoppingCartItem');
}


function getPaymentModel() {
    return server.app.bookshelf.model('Payment');
}


async function setServer(server) {
    server = server;
}


function getShippingAttributesSchema() {
    return {
        shipping_firstName: Joi.string().trim().max(255).required(),
        shipping_lastName: Joi.string().trim().max(255).required(),
        shipping_company: Joi.string().trim().max(255).empty(null),
        shipping_streetAddress: Joi.string().trim().max(255).required(),
        shipping_extendedAddress: Joi.string().trim().max(255).empty(null),
        shipping_city: Joi.string().trim().max(255).required(),
        shipping_state: Joi.string().trim().max(255).required(),
        shipping_postalCode: Joi.string().trim().max(10).required(),
        shipping_countryCodeAlpha2: Joi.string().trim().max(2).required(),  // alpha2 is required by PayPal:  https://developers.braintreepayments.com/reference/request/transaction/sale/node#billing.country_code_alpha2
        shipping_email: Joi.string().email().max(50).label('Shipping: Email').required()
    }
}


function getBillingAttributesSchema() {
    return {
        billing_firstName: Joi.string().trim().max(255),
        billing_lastName: Joi.string().trim().max(255),
        billing_company: Joi.string().trim().max(255).empty(null),
        billing_streetAddress: Joi.string().trim().max(255),
        billing_extendedAddress: Joi.string().trim().max(255).empty(null),
        billing_city: Joi.string().trim().max(255),
        billing_state: Joi.string().trim().max(255),
        billing_postalCode: Joi.string().trim().max(10),
        billing_countryCodeAlpha2: Joi.string().trim().max(2),
        billing_phone: Joi.string().trim().max(30).empty(null)
    }
}


function getDefaultWithRelated() {
    const defaultWithRelated = [
        {
            cart_items: (query) => {
                // NOTE: the problem with sorting by 'updated at' is
                // when updating the qty of an item in the UI, the cart item
                // the user is updating will unexpectedly jump to the top of the list
                // because it is the last updated item
                query.orderBy('created_at', 'DESC');
            }
        },
        {
            'cart_items.product.pics': (query) => {    // https://stackoverflow.com/questions/35679855/always-fetch-from-related-models-in-bookshelf-js#35841710
                query.where('is_visible', '=', true);
                query.orderBy('sort_order', 'ASC');

                // Somehow this is resulting in no pics being returned sometimes.
                // Commenting out for now
                // query.limit(1);
            }
        }
    ];

    return defaultWithRelated;
}


/**
 * Joi definitions for the ShoppingCart model
 *
 * NOTE:
 * The 'max' values are based on what is accepted by Braintree:
 * https://developers.braintreepayments.com/reference/request/transaction/sale/node
 */
function getShoppingCartModelSchema() {
    return Joi.object().keys({
        token: Joi.string().trim().max(100).required(),
        billing: Joi.object().keys(getBillingAttributesSchema()),
        shipping: Joi.object().keys(getShippingAttributesSchema()),
        shipping_rate: Joi.object().unknown()
    });
}


function getCartTokenFromJwt(request) {
    const req = request.raw.req;

    if(request.auth.cookieToken) {
        let decoded = jwt.verify(request.auth.cookieToken , process.env.JWT_SERVER_SECRET);
        return decoded.ct;
    }

    return null;
}


async function getCart(request, withRelatedArr) {
    const ShoppingCart = await getShoppingCartModel().query((qb) => {
        qb.where('token', '=', getCartTokenFromJwt(request));
        qb.whereNull('closed_at');
        qb.whereNull('status');
    })
    .orderBy('created_at', 'DESC')
    .fetch({
        withRelated: Array.isArray(withRelatedArr) ? withRelatedArr : getDefaultWithRelated()
    });

    return ShoppingCart;
}


/**
 * This is just a helper function to determine if the user has an active cart.
 * Used by functions below to determine if we should continue with other operations,
 * or just quit immediately.
 *
 * @param {*} request
 * @throws Error    Throws an Error if the cart is not active
 */
async function throwIfCartIsNotActive(request) {
    const ShoppingCart = await getShoppingCartModel().query((qb) => {
        qb.where('token', '=', getCartTokenFromJwt(request));
        qb.whereNull('closed_at');
        qb.whereNull('status');
    })
    .fetch();

    if(!ShoppingCart) {
        throw new Error('Unable to perform operation because shopping cart is not active');
    }
}


/**
 * Finds the cart using the cart token from JWT,
 * or creates one if it doesn't exist
 *
 * @param request
 * @returns {Promise}
 */
async function findOrCreateCart(request) {
    // If the shipping rate is a flat cost then adding it to the model now
    // so it will be readily available at checkout.  If we ever decide to
    // provide multiple shipping options in the future then this value can
    // be overridden by whatever option the user chooses at checkout.
    const ShoppingCart = await getCart(request);

    if(ShoppingCart) {
        return ShoppingCart;
    }

    return await getShoppingCartModel().create({
        token: getCartTokenFromJwt(request)
    });
}


async function cartGetHandler(request, reply) {
    try {
        const ShoppingCart = await findOrCreateCart(request);
        reply.apiSuccess(
            ShoppingCart.toJSON()
        );
    }
    catch(err) {
        reply(Boom.notFound(err));
    }
}


async function addCartItem(request) {
    try {
        const Product = await productsController.getProductByAttribute('id', request.payload.id);
        const ShoppingCart = await findOrCreateCart(request);
        const qty = request.payload.options.qty || 1;

        // Determine if we simply need to update the qty of an existing item
        // or add a new one
        let ShoppingCartItem = await getShoppingCartModel().findByVariant(
            ShoppingCart.get('id'),
            Product.get('id'),
            'size',
            request.payload.options.size
        );

        // Item with matching variants is already in the cart,
        // so we just need to update the qty, and we're done.
        if(ShoppingCartItem) {
            return await ShoppingCartItem.save(
                { qty: parseInt(ShoppingCartItem.get('qty') + qty, 10) },
                { method: 'update', patch: true }
            );
        }

        // A variant does not exist, so create a new one and return it.
        // NOTE: the value of 'variants' should be an object
        // and knex.js requires use of JSON.stringify() for json values
        // http://knexjs.org/#Schema-json
        return await getShoppingCartItemModel().create({
            qty: qty,
            variants: JSON.stringify({
                size: request.payload.options.size
            }),
            cart_id: ShoppingCart.get('id'),
            product_id: Product.get('id')
        });
    }
    catch(err) {
        global.logger.error(err);
        global.bugsnag(err);
    }
}


async function cartItemAddHandler(request, reply) {
    try {
        await throwIfCartIsNotActive(request);

        await addCartItem(request);
        const ShoppingCart = await getCart(request);

        if(!ShoppingCart) {
            throw new Error("Error getting the shopping cart");
        }

        reply.apiSuccess(
            ShoppingCart.toJSON()
        );
    }
    catch(err) {
        reply(Boom.badData(err));
    }
};


async function cartItemRemoveHandler(request, reply) {
    try {
        await throwIfCartIsNotActive(request);

        const ShoppingCartItem = await getShoppingCartItemModel().findById(request.payload.id);

        if(ShoppingCartItem) {
            await ShoppingCartItem.destroy();
        }

        const ShoppingCart = await getCart(request);

        reply.apiSuccess(
            ShoppingCart.toJSON()
        );
    }
    catch(err) {
        reply(Boom.badData(err));
    }
};


async function cartItemQtyHandler(request, reply) {
    try {
        await throwIfCartIsNotActive(request);

        const ShoppingCartItem = await getShoppingCartItemModel().findById(request.payload.id);

        if(!ShoppingCartItem) {
            throw new Error('Unable to find a shopping cart item.');
        }

        await ShoppingCartItem.save(
            { qty: parseInt((request.payload.qty || 1), 10) },
            { method: 'update', patch: true }
        );

        const ShoppingCart = await getCart(request);

        reply.apiSuccess(
            ShoppingCart.toJSON()
        );
    }
    catch(err) {
        reply(Boom.badData(err));
    }
};


async function cartShippingSetAddressHandler(request, reply) {
    try {
        let ShoppingCart = await getCart(request);

        if(ShoppingCart) {
            throw new Error('Unable to find shopping cart.')
        }

        let salesTaxParams = cloneDeep(request.payload);

        salesTaxParams.sub_total = ShoppingCart.get('sub_total');
        salesTaxParams.sales_tax = salesTaxService.getSalesTaxAmount(salesTaxParams);

        // Save the shipping params and the sales tax value in the model
        ShoppingCart = await ShoppingCart.save(
            salesTaxParams,
            { method: 'update', patch: true }
        );

        reply.apiSuccess(
            ShoppingCart.toJSON()
        );
    }
    catch(err) {
        reply(Boom.badData(err));
    }
};


async function genericCartUpdateHandler(request, reply) {
    try {
        let ShoppingCart = await getCart(request);

        ShoppingCart = await ShoppingCart.save(
            request.payload,
            { method: 'update', patch: true }
        );

        reply.apiSuccess(
            ShoppingCart.toJSON()
        );
    }
    catch(err) {
        reply(Boom.badData(err));
    }
};


// TODO: this function uses shoppingCartEmailService
async function cartCheckoutHandler(request, reply) {
    try {
        let ShoppingCart = await getCart(request);

        let transactionObj = await runPayment({
            paymentMethodNonce: request.payload.nonce,
            amount: ShoppingCart.get('grand_total'),
            customer: {
                // NOTE: Braintree requires that this email has a '.' in the domain name (i.e test@test.com)
                // which technically isn't correct. This fails validation: test@test
                email: ShoppingCart.get('shipping_email')
            },
            shipping: {
                company: ShoppingCart.get('shipping_company'),
                countryCodeAlpha2: ShoppingCart.get('shipping_countryCodeAlpha2'),
                extendedAddress: ShoppingCart.get('shipping_extendedAddress') || null,
                firstName: ShoppingCart.get('shipping_firstName'),
                lastName: ShoppingCart.get('shipping_lastName'),
                locality: ShoppingCart.get('shipping_city'),
                postalCode: ShoppingCart.get('shipping_postalCode'),
                region: ShoppingCart.get('shipping_state'),
                streetAddress: ShoppingCart.get('shipping_streetAddress')
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

        // TODO: shoppingCartEmailService may need some refactoring
        // because the mailcomposer npm lib is deprecated
        // try {
              shoppingCartEmailService.sendPurchaseEmails(ShoppingCart, transactionObj.transaction.id)
        // }
        // catch(err) {
        //     let msg = `Unable to send email confirmation to user after successful purchase: (ShoppingCart ID: ${ShoppingCart.get('id')}) ${err}`;
        //     global.logger.error(msg);
        //     global.bugsnag(msg);
        // }

        // If the Braintree transaction is successful then anything that happens after this
        // (i.e saving the payment details to DB) needs to fail silently, as the user has
        // already been changed and we can't give the impression of an overall transaction
        // failure that may prompt them to re-do the purchase.

        // Saving the payment transaction whether it was successful (transactionObj.success === true)
        // or not (transactionObj.success === false)
        // Any failures that happen while saving the payment info do not affect the
        // braintree transaction and thus should fail silently.
        try {
            await savePayment(ShoppingCart.get('id'), transactionObj)
        }
        catch(err) {
            let msg = `ERROR SAVING PAYMENT INFO: ${err}`;
            global.logger.error(msg)
            global.bugsnag(msg);
        }

        // Updating the cart with the billing params and the 'closed_at'
        // timestamp if transaction was successful:
        let updateParams = cloneDeep(request.payload);
        delete updateParams.nonce;

        if(transactionObj.success) {
            // This will cause the cart not to be re-used
            // (See ShoppingCart -> getCart())
            updateParams.closed_at = new Date();
        }

        try {
            await ShoppingCart.save(
                updateParams,
                { method: 'update', patch: true }
            );
        }
        catch(err) {
            global.logger.error(err);
            global.bugsnag(err);
        }

        // Successful transactions return the transaction id
        if(transactionObj.success) {
            reply.apiSuccess({
                transactionId: transactionObj.transaction.id
            });
        }
        else {
            throw new Error(transactionObj.message || 'An error occurred when saving the payment transaction data.')
        }
    }
    catch(err) {
        let msg = err instanceof Error ? err.message : err;
        // NOTE: Boom errors are automatically logged by the onPreResponse handler
        reply(Boom.badData(msg));
    }
};


/**
 * Gets a payment by a given attribute
 *
 * @param attrName
 * @param attrValue
 */
async function getPaymentByAttribute(attrName, attrValue) {
    const payment = await getPaymentModel().query((qb) => {
        qb.where(attrName, '=', attrValue);  // TODO: Is there a SQL injection risk here?
    })
    .fetch({
        withRelated: [
            'shoppingCart.cart_items.product' // https://stackoverflow.com/questions/35679855/always-fetch-from-related-models-in-bookshelf-js#35841710
        ]
    });

    return payment;
}


async function getOrdersHandler(request, reply) {
    try {
        const orders = await HelperService.fetchPage(
            request,
            getPaymentModel(),
            ['shoppingCart.cart_items.product']
        );

        reply.apiSuccess(
            orders, orders.pagination
        );
    }
    catch(err) {
        global.logger.error(err);
        global.bugsnag(err);
        reply(Boom.notFound(err));
    }
}


async function getOrderHandler(request, reply) {
    try {
        const payment = await getPaymentByAttribute('transaction_id', request.query.transaction_id);

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
    }
    catch(err) {
        global.logger.error(err);
        global.bugsnag(err);
        reply(Boom.badRequest(err));
    }
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
async function getPaymentClientTokenHandler(request, reply) {
    try {
        const response = await global.braintreeGateway.clientToken.generate({});

        if(!response.clientToken) {
            throw new Error('Error generating client token.')
        }

        reply.apiSuccess(
            response.clientToken
        );
    }
    catch(err) {
        global.logger.error(err);
        global.bugsnag(err);
        reply(Boom.badRequest(err));
    }
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
    if(!isObject(transactionJson) || !isObject(transactionJson.transaction)) {
        throw new Error('An error occurred while processing the transaction: transactionJson.transaction is not an object')
    }

    const Payment = await getPaymentModel().forge().save(
        {
            cart_id: cart_id,
            transaction_id: transactionJson.transaction.id,
            transaction: transactionJson.transaction,
            success: transactionJson.success || null
        },
        {
            method: 'insert'
        }
    );

    return Payment.toJSON();
}


/**
 * Submits a payment 'sale' to Braintree
 *
 * @param opts  Options object to pass to braintree.transaction.sale
 * @returns {Promise}
 */
async function runPayment(opts) {
    try {
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
        else {
            throw new Error(result.message);
        }
    }
    catch(err) {
        global.logger.error(err);
        global.bugsnag(err);
    }
}



module.exports = {
    setServer,
    getShippingAttributesSchema,
    getBillingAttributesSchema,
    getShoppingCartModelSchema,
    getCartTokenFromJwt,
    getCart,
    cartIsActive,
    findOrCreateCart,

    //payments
    getPaymentByAttribute,
    savePayment,
    runPayment,

    // route handlers:
    cartGetHandler,
    cartItemAddHandler,
    cartItemRemoveHandler,
    cartItemQtyHandler,
    cartShippingSetAddressHandler,
    genericCartUpdateHandler,
    cartCheckoutHandler,
    getOrdersHandler,
    getOrderHandler,
    getPaymentClientTokenHandler,
}
