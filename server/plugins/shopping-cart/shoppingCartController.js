'use strict';
const Joi = require('joi');
const Boom = require('boom');
const cloneDeep = require('lodash.clonedeep');

const uuidV4 = require('uuid/v4');
const uuidValidate = require('uuid-validate');
const Cookie = require('cookie');
const accounting = require('accounting');

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


/**
 * Gets a ShoppingCart by a given attribute
 *
 * @param attrName
 * @param attrValue
 * @param withRelatedArr
 */
async function getCartByAttribute(attrName, attrValue, withRelatedArr) {
    let fetchObj = null;

    if(Array.isArray(withRelatedArr)) {
        fetchObj = {
            withRelated: withRelatedArr
        }
    }

    const ShoppingCart = await getShoppingCartModel().query((qb) => {
        qb.where(attrName, '=', attrValue);  // TODO: Is there a SQL injection risk here?
    })
    .fetch(fetchObj);

    global.logger.debug("CART BY ATTRIBUTE", attrName, attrValue, (ShoppingCart ? ShoppingCart.toJSON() : null));

    return ShoppingCart;
}


async function getCart(cartToken, withRelatedArr) {
    let withRelated = Array.isArray(withRelatedArr) ? withRelatedArr : getDefaultWithRelated();

    const ShoppingCart = await getCartByAttribute(
        'token',
        cartToken,
        withRelated
    );

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

    const ShoppingCart = await getCartByAttribute(
        'token',
        cartToken
    )

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

        console.log("UpdatedShoppingCart", UpdatedShoppingCart.toJSON())

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
async function createShippoOrderFromShoppingCart(ShoppingCart) {
    if(!ShoppingCart) {
        let err = new Error('createShippoOrderFromShoppingCart: ShoppingCart obejct was not passed as an argument');
        global.logger.error(err);
        global.bugsnag(err);

        throw err;
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

    let shippoOrderJSON = await shippoOrdersAPI.createOrder(data);
    global.logger.debug("CREATE SHIPPO ORDER FROM SHOPPING CART RESPONSE", shippoOrderJSON);

    return shippoOrderJSON;
}


function sendPurchaseConfirmationEmails(cartToken, payment_id) {
    return new Promise(async (resolve, reject) => {
        // Get a fresh cart with all of the relations for the email message
        let ShoppingCart = await getCart(cartToken);

        try {
            await shoppingCartEmailService.sendPurchaseEmails(ShoppingCart, payment_id);

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
    const { runPayment, savePayment } = require('../payment/paymentController');

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

        // Saving the payment transaction whether it was successful (transactionObj.success === true)
        // or not (transactionObj.success === false)
        // NOTE: Originally I was not raising any errors to the user that happen while saving to the DB.
        // However I think it's worth doing so because immediately after the transaction we display
        // the transaction summary to the user, and we would have nothing to display if there
        // was an error saving that data, giving the impression that the order was not successful.
        // Therefore any errors that happen here (promise is rejected) will be caught below

        const Payment = await savePayment(ShoppingCart.get('id'), transactionObj);

        // NOTE: Any failures that happen after this do not affect the braintree transaction
        // and thus should fail silently (catching and logging errors), as the user has already been changed
        // and we can't give the impression of an overall transaction failure that may prompt them
        // to re-do the purchase.

        // Updating the cart with the billing params and the 'closed_at'
        // timestamp if transaction was successful:
        let updateParams = cloneDeep(request.payload);
        delete updateParams.nonce;

         // Create the Order in Shippo so a shipping label can be created in the future.
        // let shippoOrder = await createShippoOrderFromShoppingCart(ShoppingCart);
        // updateParams.shippo_order_id = shippoOrder.object_id;

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
        sendPurchaseConfirmationEmails(cartToken, Payment.get('id'))

        // Successful transactions return the transaction id
        if(transactionObj.success) {
            return h.apiSuccess({
                transactionId: Payment.get('id')
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


module.exports = {
    setServer,
    pre_cart,
    getDefaultWithRelated,
    getShippingAttributesSchema,
    getBillingAttributesSchema,
    getShoppingCartModelSchema,
    getCartTokenFromJwt,
    getCart,
    getCartByAttribute,
    getActiveCart,
    getValidCartTokenFromRequest,
    createShippoOrderFromShoppingCart,

    // route handlers:
    cartGetHandler,
    cartItemAddHandler,
    cartItemRemoveHandler,
    cartItemQtyHandler,
    cartShippingSetAddressHandler,
    getCartShippingRatesHandler,
    cartShippingRateHandler,
    cartCheckoutHandler
}
