'use strict';
const Joi = require('joi');
const Boom = require('boom');
const cloneDeep = require('lodash.clonedeep');
const isObject = require('lodash.isobject');
const uuidV4 = require('uuid/v4');
const uuidValidate = require('uuid-validate');
const Cookie = require('cookie');
const accounting = require('accounting');
const HelperService = require('../../helpers.service');
const salesTaxService = require('./services/SalesTaxService');
const shoppingCartEmailService = require('./services/ShoppingCartEmailService');
const productsController = require('../products/productsController')
const shippingController = require('../shipping/shippingController');
const shippoOrdersAPI = require('../shipping/shippoAPI/orders');

let server = null;


function getShoppingCartModel() {
    return server.app.bookshelf.model('ShoppingCart');
}


function getShoppingCartItemModel() {
    return server.app.bookshelf.model('ShoppingCartItem');
}

function getShoppingCartToShippoOrderModel() {
    return server.app.bookshelf.model('ShoppingCartToShippoOrder');
}

function getPaymentModel() {
    return server.app.bookshelf.model('Payment');
}


function setServer(s) {
    server = s;
    productsController.setServer(s);
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
            },
            // product sizes are needed for the calculation of shipping rates
            'cart_items.product.sizes': (query) => {
                query.where('is_visible', '=', true);
                query.orderBy('sort', 'ASC');
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
    if(request.auth.credentials) {
        return request.auth.credentials.ct;
    }
    return null;
}


function getValidCartTokenFromRequest(request) {
    if (request.headers.cookie) {
        const token = Cookie.parse(request.headers.cookie)['cart_token'];

        if(token || uuidValidate(token, 4)) {
            return token;
        }
    }

    return false;
}


function getOrCreateCartToken(request) {
    const uuid = uuidV4();

    if (!request.headers.cookie) {
        return uuid;
    }

    const token = Cookie.parse(request.headers.cookie)['cart_token'];

    if(!token || !uuidValidate(token, 4)) {
        return uuid;
    }

    return token;
}


async function getCart(cartToken, withRelatedArr) {
    const ShoppingCart = await getShoppingCartModel().query((qb) => {
        qb.where('token', '=', cartToken);
    })
    .orderBy('created_at', 'DESC')
    .fetch({
        withRelated: Array.isArray(withRelatedArr) ? withRelatedArr : getDefaultWithRelated()
    });

    return ShoppingCart;
}


/**
 * This is just a helper function to determine if the cart token being sent
 * is for an active cart.
 * Used by functions below to determine if we should continue with other operations,
 * or just quit immediately.
 *
 * @param String    cartToken
 * @throws Error    Throws an Error if the cart is not active
 */
async function getActiveCart(cartToken) {
    if(!cartToken) {
        return false
    }

    const ShoppingCart = await getShoppingCartModel().query((qb) => {
        qb.where('token', '=', cartToken);
    })
    .fetch();

    if(!ShoppingCart || ShoppingCart.get('closed_at')) {
        return false;
    }

    return ShoppingCart;
}


async function createCart(token) {
    return await getShoppingCartModel().create({
        token: token
    });
}


async function pre_cart(request, h) {
    let cartToken = getValidCartTokenFromRequest(request);
    let ShoppingCart = await getActiveCart(cartToken);

    // Quit right here if no shopping cart.
    // Returning a new shopping cart allong with it's access token
    // in the response header
    try {
        if(!ShoppingCart) {
            cartToken = uuidV4();
            ShoppingCart = await createCart(cartToken);

            return h.apiSuccess(
                ShoppingCart.toJSON()
            )
            .header('X-Cart-Token', cartToken)
            .takeover();
        }

        return {
            ShoppingCart,
            cartToken
        };
    }
    catch(err) {
        global.logger.error(err);
        global.bugsnag(err);
        throw Boom.notFound(err);
    }
}


async function cartGetHandler(request, h) {
    try {
        const cartToken = request.pre.m1.cartToken;

        // Get a fresh cart for the response with all of the relations
        const ShoppingCart = await getCart(cartToken);

        // Response contains the cart token in the header
        // plus the shopping cart payload
        return h.apiSuccess(
            ShoppingCart.toJSON()
        ).header('X-Cart-Token', cartToken);
    }
    catch(err) {
        global.logger.error(err);
        global.bugsnag(err);
        throw Boom.notFound(err);
    }
}


/**
 * This is the users first interaction with the shopping cart.
 * The response header will contain the cart token that must be used
 * for subsequent interaction with the cart.
 * The respose payload will be the shopping cart itself in JSON format.
 *
 * @param {*} request
 * @param {*} h
 */
async function cartItemAddHandler(request, h) {
    try {
        let cartToken = getValidCartTokenFromRequest(request);
        let ShoppingCart = await getActiveCart(cartToken);

        // If the current cart is closed then get a fresh one
        if(!ShoppingCart) {
            cartToken = uuidV4();
            ShoppingCart = await createCart(cartToken);
        }

        const Product = await productsController.getProductByAttribute('id', request.payload.id);

        if(!Product) {
            throw new Error('Unable to find product');
        }

        const qty = request.payload.options.qty || 1;

        // Determine if we simply need to update the qty of an existing item
        // or add a new one
        let ShoppingCartItem = await getShoppingCartItemModel().findByVariant(
            ShoppingCart.get('id'),
            Product.get('id'),
            'size',
            request.payload.options.size
        );

        // Item with matching variants is already in the cart,
        // so we just need to update the qty.
        if(ShoppingCartItem) {
            await ShoppingCartItem.save(
                { qty: parseInt(ShoppingCartItem.get('qty') + qty, 10) },
                { method: 'update', patch: true }
            );
        }
        else {
            // A variant does not exist, so create a new one.
            // NOTE: the value of 'variants' should be an object
            // and knex.js requires use of JSON.stringify() for json values
            // http://knexjs.org/#Schema-json
            await getShoppingCartItemModel().create({
                qty: qty,
                variants: JSON.stringify({
                    size: request.payload.options.size
                }),
                cart_id: ShoppingCart.get('id'),
                product_id: Product.get('id')
            });
        }

        // Get a fresh cart for the response with all of the relations
        ShoppingCart = await getCart(cartToken);

        if(!ShoppingCart) {
            throw new Error("Error getting the shopping cart");
        }

        // Response contains the cart token in the header
        // plus the shopping cart payload
        return h.apiSuccess(
            ShoppingCart.toJSON()
        ).header('X-Cart-Token', cartToken);
    }
    catch(err) {
        global.logger.error(err);
        global.bugsnag(err);
        throw Boom.badData(err);
    }
};


// Note: route handler calles the defined 'pre' method before it gets here
async function cartItemRemoveHandler(request, h) {
    try {
        const cartToken = request.pre.m1.cartToken;
        const ShoppingCartItem = await getShoppingCartItemModel().findById(request.payload.id);

        global.logger.debug("REMOVING CART ITEM", ShoppingCartItem ? ShoppingCartItem.toJSON() : ShoppingCartItem);

        if(ShoppingCartItem) {
            await ShoppingCartItem.destroy();
        }

        // Get a fresh cart for the response with all of the relations
        const ShoppingCart = await getCart(cartToken);

        // Response contains the cart token in the header
        // plus the shopping cart payload
        return h.apiSuccess(
            ShoppingCart.toJSON()
        ).header('X-Cart-Token', cartToken);

    }
    catch(err) {
        global.logger.error(err);
        global.bugsnag(err);
        throw Boom.badData(err);
    }
};


// Note: route handler calles the defined 'pre' method before it gets here
async function cartItemQtyHandler(request, h) {
    try {
        const cartToken = request.pre.m1.cartToken;
        const ShoppingCartItem = await getShoppingCartItemModel().findById(request.payload.id);

        if(!ShoppingCartItem) {
            throw new Error('Unable to find a shopping cart item.');
        }

        await ShoppingCartItem.save(
            { qty: parseInt((request.payload.qty || 1), 10) },
            { method: 'update', patch: true }
        );

        // Get a fresh cart for the response with all of the relations
        const ShoppingCart = await getCart(cartToken);

        return h.apiSuccess(
            ShoppingCart.toJSON()
        ).header('X-Cart-Token', cartToken);
    }
    catch(err) {
        global.logger.error(err);
        global.bugsnag(err);
        throw Boom.badData(err);
    }
};


// Note: route handler calles the defined 'pre' method before it gets here
async function cartShippingSetAddressHandler(request, h) {
    try {
        const cartToken = request.pre.m1.cartToken;

        // Get a fresh cart for the response with all of the relations
        let ShoppingCart = await getCart(cartToken);

        let updateData = cloneDeep(request.payload);
        updateData.sub_total = ShoppingCart.get('sub_total');
        updateData.sales_tax = salesTaxService.getSalesTaxAmount(updateData);

        global.logger.debug("cartShippingSetAddressHandler - CART UPDATE PARAMS", updateData);

        // Save the shipping params and the sales tax value in the model:
        // Kind of awkward, but need to update the ShoppingCart twice in this
        // method because the getLowestShippingRate() method needs the shipping
        // address data from the ShoppingCart object
        let UpdatedShoppingCart = await ShoppingCart.save(
            updateData,
            { method: 'update', patch: true }
        );

        // This may change in the future when we offer the user the choice of several
        // different shipping rates, but for now the user doesn't get to choose and
        // we are fetching the lowest shipping rate and saving it in the shopping cart
        let updateData2 = {
            shipping_rate: await getLowestShippingRate(UpdatedShoppingCart)
        }

        // Save the shipping rate in the ShoppingCart:
        let UpdatedShoppingCart2 = await ShoppingCart.save(
            updateData2,
            { method: 'update', patch: true }
        );

        global.logger.debug("Updated cart with shipping rate", UpdatedShoppingCart2.toJSON());

        // Response contains the cart token in the header
        // plus the shopping cart payload
        return h.apiSuccess(
            UpdatedShoppingCart2.toJSON()
        ).header('X-Cart-Token', cartToken);
    }
    catch(err) {
        global.logger.error(err);
        global.bugsnag(err);
        throw Boom.badData(err);
    }
};


async function getCartShippingRatesHandler(request, h) {
    try {
        const cartToken = request.pre.m1.cartToken;
        const ShoppingCart = await getCart(cartToken);
        const shipment = await shippingController.createShipmentFromShoppingCart(ShoppingCart);

        return h.apiSuccess(
            shipment.rates
        ).header('X-Cart-Token', cartToken);
    }
    catch(err) {
        global.logger.error(err);
        global.bugsnag(err);
        throw Boom.badData(err);
    }
}


/**
 * Gets the lowest shipping rate via the Shippo API
 *
 * @param {*} ShoppingCart  This needs to be a ShoppingCart
 *                          object with the cart_items relations
 */
async function getLowestShippingRate(ShoppingCart) {
    let lowestRate = null;

    // Get a fresh cart with all of the relations
    const shipment = await shippingController.createShipmentFromShoppingCart(ShoppingCart);

    if(Array.isArray(shipment.rates)) {
        if(!lowestRate) {
            lowestRate = shipment.rates[0];
        }

        shipment.rates.forEach((rate) => {
            if(parseFloat(rate.amount) < parseFloat(lowestRate.amount)) {
                lowestRate = rate;
            }
        })
    }

    // Fallback... hopefully this never happens
    if(!lowestRate) {
        lowestRate = {
            amount: '5.00',
            currency: 'USD',
            provider: 'USPS',
            provider_image_75: 'https://shippo-static.s3.amazonaws.com/providers/75/USPS.png',
            provider_image_200: 'https://shippo-static.s3.amazonaws.com/providers/200/USPS.png',
            servicelevel: {
                name: 'First-Class Package/Mail Parcel',
                token: 'usps_first',
            },
            estimated_days: 5
        };
    }

    global.logger.debug("LOWEST SHIPPING RATE", lowestRate)

    return lowestRate;
}


// Note: route handler calles the defined 'pre' method before it gets here
async function cartShippingRateHandler(request, h) {
    try {
        const cartToken = request.pre.m1.cartToken;
        await request.pre.m1.ShoppingCart.save(
            request.payload,
            { method: 'update', patch: true }
        );

        // Get a fresh cart for the response with all of the relations
        const ShoppingCart = await getCart(cartToken);

        // Response contains the cart token in the header
        // plus the shopping cart payload
        return h.apiSuccess(
            ShoppingCart.toJSON()
        ).header('X-Cart-Token', cartToken);
    }
    catch(err) {
        global.logger.error(err);
        global.bugsnag(err);
        throw Boom.badData(err);
    }
};


/**
 * Creates an "Order" on Shippo using the ShoppingCart
 * NOTE: The ShoppingCart with all relations is needed here!
 *
 * @param {*} ShoppingCart
 */
function createShippoOrderFromShoppingCart(ShoppingCart) {
    return new Promise((resolve, reject) => {
        if(!ShoppingCart) {
            let err = new Error('createShippoOrderFromShoppingCart: ShoppingCart obejct was not passed as an argument');
            global.logger.error(err);
            global.bugsnag(err);
            reject(err);
            return;
        }

        let cart = ShoppingCart.toJSON();
        let totalWeight = 0;

        let data = {
            to_address: {
                city: cart.shipping_city,
                company: cart.shipping_company,
                country: cart.shipping_countryCodeAlpha2,
                email: cart.shipping_email,
                name: cart.shipping_fullName,
                state: cart.shipping_state,
                street1: cart.shipping_streetAddress,
                zip: cart.shipping_postalCode
            },
            line_items: [],
            placed_at: new Date().toISOString(),
            order_number: cart.id,
            order_status: 'PAID',
            shipping_cost: cart.shipping_rate.amount,
            shipping_cost_currency: cart.shipping_rate.currency,
            shipping_method: cart.shipping_rate.servicelevel.name,
            subtotal_price: cart.sub_total,
            total_price: cart.grand_total,
            total_tax: cart.sales_tax,
            currency: 'USD',
            weight: 0,
            weight_unit: 'oz'
        };

        // building data.line_items
        cart.cart_items.forEach((obj) => {
            let itemWeight = obj.product.weight_oz * obj.qty;
            totalWeight += itemWeight;

            data.line_items.push({
                quantity: obj.qty,
                sku: obj.product.id,
                title: obj.product.title,
                total_price: obj.total_item_price,
                currency: 'USD',
                weight: accounting.toFixed(itemWeight, 2),
                weight_unit: 'oz'
            })
        });

        data.weight = totalWeight;

        try {
            let ShippoOrder = shippoOrdersAPI.createOrder(data);
            resolve(ShippoOrder);
        }
        catch(err) {
            global.logger.error(err)
            global.bugsnag(err);
            reject(err);
        }
    });
}


async function saveShippoOrder(cart_id, ShippoOrderJson) {
    return new Promise((resolve, reject) => {
        getShoppingCartToShippoOrderModel()
            .forge()
            .save(
                {
                    cart_id: cart_id,
                    shippo_order: ShippoOrderJson
                },
                {
                    method: 'insert'
                }
            )
            .then((ShoppingCartToShippoOrder) => {
                resolve(ShoppingCartToShippoOrder);
            })
            .catch((err) => {
                let msg = `ERROR SAVING SHIPPO ORDER: ${err}`;
                global.logger.error(msg)
                global.bugsnag(msg);

                reject(err);
            });
    });
}


async function getShippoOrder(cartId) {
    const ShoppingCartToShippoOrder = await getShoppingCartToShippoOrderModel().query((qb) => {
        qb.where('cart_id', '=', cartId);
    }).fetch();

    return ShoppingCartToShippoOrder;
}


function sendPurchaseConfirmationEmails(cartToken, transactionId) {
    return new Promise(async (resolve, reject) => {
        // Get a fresh cart with all of the relations for the email message
        let ShoppingCart = await getCart(cartToken);

        try {
            await shoppingCartEmailService.sendPurchaseEmails(ShoppingCart, transactionId);

            let emailSentAt = new Date().toISOString();
            await ShoppingCart.save(
                { purchase_confirmation_email_sent_at: emailSentAt },
                { method: 'update', patch: true }
            );
            resolve(emailSentAt)
        }
        catch(err) {
            let msg = `Unable to send email confirmation to user after successful purchase: (ShoppingCart ID: ${ShoppingCart.get('id')})`;
            global.logger.error(msg, err);
            global.bugsnag(msg, err);
            reject(err);
        }
    });
}


// TODO: this function uses shoppingCartEmailService
// Note: route handler calles the defined 'pre' method before it gets here
async function cartCheckoutHandler(request, h) {
    try {
        const cartToken = request.pre.m1.cartToken;
        const ShoppingCart = await getCart(cartToken);

        // throws Error
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

        // If we got here then the Braintree transaction was successful
        // (because runPayment() throws an Error)
        // Anything that happens after this (i.e saving the payment details to DB)
        // needs to fail silently, as the user has already been changed and we can't
        // give the impression of an overall transaction failure that may prompt them
        // to re-do the purchase.

        // Saving the payment transaction whether it was successful (transactionObj.success === true)
        // or not (transactionObj.success === false)
        // Any failures that happen while saving the payment info do not affect the
        // braintree transaction and thus should fail silently.
        // NOTE: doing nothing with the promise response here (Payment).  The method logs errors too
        savePayment(ShoppingCart.get('id'), transactionObj)

        // Create the Order in Shippo so a shipping label can be created in the future.
        createShippoOrderFromShoppingCart(ShoppingCart).then((ShippoOrder) => {
            saveShippoOrder(ShoppingCart.get('id'), ShippoOrder);
        })

        // Updating the cart with the billing params and the 'closed_at'
        // timestamp if transaction was successful:
        let updateParams = cloneDeep(request.payload);
        delete updateParams.nonce;

        if(transactionObj.success) {
            // This will cause the cart not to be re-used
            // (See ShoppingCart -> getCart())
            updateParams.closed_at = new Date();
        }

        // Update the cart with the billing info and the closed_at value
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

        // Sending the purchase emails:
        sendPurchaseConfirmationEmails(cartToken, transactionObj.transaction.id)

        // Successful transactions return the transaction id
        if(transactionObj.success) {
            return h.apiSuccess({
                transactionId: transactionObj.transaction.id
            });
        }
        else {
            throw new Error(transactionObj.message || 'An error occurred when saving the payment transaction data.')
        }
    }
    catch(err) {
        let msg = err instanceof Error ? err.message : err;
        global.logger.error(msg);
        global.bugsnag(msg);
        throw Boom.badData(msg);
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


async function getOrdersHandler(request, h) {
    try {
        const orders = await HelperService.fetchPage(
            request,
            getPaymentModel(),
            ['shoppingCart.cart_items.product']
        );

        return h.apiSuccess(
            orders, orders.pagination
        );
    }
    catch(err) {
        global.logger.error(err);
        global.bugsnag(err);
        throw Boom.notFound(err);
    }
}


async function getOrderHandler(request, h) {
    try {
        const order = await getPaymentByAttribute('id', request.query.id);

        if(!order) {
            throw Boom.notFound('Order not found');
        }

        return h.apiSuccess(
            order.toJSON()
        );
    }
    catch(err) {
        global.logger.error(err);
        global.bugsnag(err);
        throw Boom.notFound(err);
    }
}


async function getOrderTransactionHandler(request, h) {
    try {
        const payment = await getPaymentByAttribute('transaction_id', request.query.transaction_id);

        if(!payment) {
            throw Boom.notFound('Order not found');
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

        return h.apiSuccess(response);
    }
    catch(err) {
        global.logger.error(err);
        global.bugsnag(err);
        throw Boom.badRequest(err);
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
async function getPaymentClientTokenHandler(request, h) {
    try {
        // just verifyig that a shopping cart exists for this user.
        // If not, no need to generate the token
        let ShoppingCart = await getActiveCart(
            getValidCartTokenFromRequest(request)
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
    return new Promise((resolve, reject) => {
        if(!isObject(transactionJson) || !isObject(transactionJson.transaction)) {
            reject(new Error('An error occurred while processing the transaction: transactionJson.transaction is not an object'));
            return;
        }

        // const Payment = await getPaymentModel().forge().save(
        getPaymentModel()
            .forge()
            .save(
                {
                    cart_id: cart_id,
                    transaction_id: transactionJson.transaction.id,
                    transaction: transactionJson.transaction,
                    success: transactionJson.success || null
                },
                {
                    method: 'insert'
                }
            )
            .then((Payment) => {
                resolve(Payment.toJSON());
                return;
            })
            .catch((err) => {
                let msg = `ERROR SAVING PAYMENT INFO: ${err}`;
                global.logger.error(msg)
                global.bugsnag(msg);

                reject(err);
            });
    });
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
        throw new Error(err);
    }
}



module.exports = {
    setServer,
    pre_cart,
    getShippingAttributesSchema,
    getBillingAttributesSchema,
    getShoppingCartModelSchema,
    getCartTokenFromJwt,
    getCart,
    createShippoOrderFromShoppingCart,
    saveShippoOrder,

    //payments
    getPaymentByAttribute,
    savePayment,
    runPayment,

    // shippo orders
    getShippoOrder,

    // route handlers:
    cartGetHandler,
    cartItemAddHandler,
    cartItemRemoveHandler,
    cartItemQtyHandler,
    cartShippingSetAddressHandler,
    getCartShippingRatesHandler,
    cartShippingRateHandler,
    cartCheckoutHandler,
    getOrdersHandler,
    getOrderHandler,
    getOrderTransactionHandler,
    getPaymentClientTokenHandler,
}
