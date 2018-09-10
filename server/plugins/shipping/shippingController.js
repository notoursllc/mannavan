'use strict';

const Wreck = require('wreck');
const Boom = require('boom');
const Joi = require('joi');
const isObject = require('lodash.isobject');
const forEach = require('lodash.foreach');
const helpers = require('../../helpers.service');
const { createCustomsItem } = require('./shippoAPI/customs_items.js');
const { createShipment } = require('./shippoAPI/shipments.js');
const { createParcel } = require('./shippoAPI/parcels.js');
// const { getShippingLabel } = require('./shippoAPI/transactions.js');
// const shoppingCartController = require('../shopping-cart/shoppingCartController');

const wreck = Wreck.defaults({
    baseUrl: 'https://api.shipengine.com/v1',
    json: true,
    headers: {
        'api-key': process.env.SHIPENGINE_API_KEY_PROD,
        'Content-Type': 'application/json'
    }
});

let server = null;


function getPackageTypesModel() {
    return server.app.bookshelf.model('PackageTypes');
}


function setServer(s) {
    server = s;
}


function getPackageTypeSchema() {
    return {
        type: Joi.number().integer().positive().required(),
        label: Joi.string().max(100).required(),
        length: Joi.number().precision(2).min(0).required(),
        width: Joi.number().precision(2).min(0).required(),
        height: Joi.number().precision(2).min(0).allow(null),
        weight: Joi.number().precision(2).min(0).allow(null),
        mass_unit: Joi.string().allow('oz').optional(),  // see note #1 below
        distance_unit: Joi.string().length(2).required(),
        created_at: Joi.date(),
        updated_at: Joi.date()
    };
}


/**
 * Gets a package type by a given attribute, or all results if no attributes are passed
 *
 * @param attrName
 * @param attrValue
 * @returns {Promise}
 */
async function getPackageTypeByAttribute(attrName, attrValue) {
    let forgeOpts = null;

    if(attrName) {
        forgeOpts = {};
        forgeOpts[attrName] = attrValue;
    }

    return await getPackageTypesModel().forge(forgeOpts).fetch();
}


/**
 * Route handler for getting a PackageType by ID
 *
 * @param {*} request
 * @param {*} h
 */
async function getPackageTypeByIdHandler(request, h) {
    try {
        const PackageType = await getPackageTypeByAttribute('id', request.query.id)
        return h.apiSuccess(PackageType);
    }
    catch(err) {
        global.logger.error(err);
        global.bugsnag(err);
        throw Boom.badRequest(err);
    }
}


/**
 * Route handler for creating a new PackageType
 *
 * @param {*} request
 * @param {*} h
 */
async function packageTypeListHandler(request, h) {
    try {
        const PackageTypes = await helpers.fetchPage(
            request,
            getPackageTypesModel()
        );

        return h.apiSuccess(
            PackageTypes,
            PackageTypes.pagination
        );
    }
    catch(err) {
        global.logger.error(err);
        global.bugsnag(err);
        throw Boom.notFound(err);
    }
}

/**
 * Route handler for creating a new PackageType
 *
 * @param {*} request
 * @param {*} h
 */
async function packageTypeCreateHandler(request, h) {
    try {
        const PackageType = await getPackageTypesModel().create(request.payload);

        if(!PackageType) {
            throw Boom.badRequest('Unable to create a a new package type.');
        }

        return h.apiSuccess(
            PackageType.toJSON()
        );
    }
    catch(err) {
        global.logger.error(err);
        global.bugsnag(err);
        throw Boom.badRequest(err);
    }
}


/**
 * Route handler for updating a package type
 *
 * @param {*} request
 * @param {*} h
 */
 async function packageTypeUpdateHandler(request, h) {
    try {
        request.payload.updated_at = request.payload.updated_at || new Date();

        const PackageType = await getPackageTypesModel().update(
            request.payload,
            { id: request.payload.id }
        );

        if(!PackageType) {
            throw Boom.badRequest('Unable to find package type.');
        }

        return h.apiSuccess(
            PackageType.toJSON()
        );
    }
    catch(err) {
        global.logger.error(err);
        global.bugsnag(err);
        throw Boom.badRequest(err);
    }
}


/**
 * Route handler for deleting a package type
 *
 * @param {*} request
 * @param {*} h
 */
async function packageTypeDeleteHandler(request, h) {
    try {
        // Note that a successful destroy returns an empty model (an empty object)
        const PackageType = await getPackageTypesModel().destroy(
            { id: request.query.id }
        );

        if(!PackageType) {
            throw Boom.badRequest('Unable to find package type.');
        }

        return h.apiSuccess(
            PackageType.toJSON()
        );
    }
    catch(err) {
        global.logger.error(err);
        global.bugsnag(err);
        throw Boom.badRequest(err);
    }
}


/**
 * Route handler for getting a PackageType by ID
 *
 * @param {*} request
 * @param {*} h
 */
async function getShippingLabelHandler(request, h) {
    try {
        console.log("getShippingLabelHandler", request.payload.id)
        const response = await getShippingLabelByOrderId(request.payload.id);

        if(!response) {
            throw Boom.badRequest(`Unable to get a shipping label for order ID ${request.payload.id}.`);
        }

        return h.apiSuccess(
            response.data
        );
    }
    catch(err) {
        global.logger.error(err);
        global.bugsnag(err);
        throw Boom.badRequest(err);
    }
}


function getShipEngineErrorMessage(err) {
    let message = null;

    if(err.data.isResponseError && Array.isArray(err.data.payload.errors)) {
        let msgs = [];

        err.data.payload.errors.forEach((obj) => {
            msgs.push(obj.message)
        });

        if(msgs.length) {
            message = msgs.join(' ');
        }
    }

    return message;
}


/**
 * Returns an array of ShipEngine carrier ID's for a given 2 character country code
 * Note USPS does ship internationally:  https://www.usps.com/international/international-how-to.htm
 *
 * @param string countryCode
 * @returns []
 */
function getCarrierIdsForCountry(countryCode) {
    switch(countryCode) {
        case 'US':
            return [process.env.SHIPENGINE_CARRIER_ID_STAMPSCOM];

        default:
            return [
                process.env.SHIPENGINE_CARRIER_ID_STAMPSCOM,
                process.env.SHIPENGINE_CARRIER_ID_FEDEX
            ];
    }
}


function parseShippingRateResponse(response) {
    let packageTypeWhitelist = [
        'package',
        'medium_flat_rate_box',
        'small_flat_rate_box',
        'large_flat_rate_box',
        'regional_rate_box_a',
        'regional_rate_box_b'
    ];

    /*
     * Known service codes:
     * FEDEX: fedex_first_overnight, fedex_priority_overnight, fedex_standard_overnight, fedex_2day_am, fedex_2day,
     *        fedex_express_saver, fedex_ground
     *
     * USPS: usps_first_class_mail, usps_priority_mail, usps_priority_mail_express, usps_media_mail, usps_parcel_select
     *
     * USPS services: https://pe.usps.com/text/dmm100/choosing-service.htm
     */
    let serviceCodeWhitelist = [
        'usps_priority_mail',
        'usps_parcel_select', // aka "USPS Retail Select", I think
        'fedex_express_saver',
        'fedex_2day'
    ]

    let filtered = [];
    let lowestByCode = {};

    // Deletes indexes that are higher than their supposidly more expensive counterpart
    let doFinalTuning = (codeThatShouldBeHigher, codeThatShouldBeLower) => {
        if(lowestByCode[codeThatShouldBeHigher]
            && lowestByCode[codeThatShouldBeLower]
            && (lowestByCode[codeThatShouldBeHigher].shipping_amount.amount <= lowestByCode[codeThatShouldBeLower].shipping_amount.amount)) {
            delete lowestByCode[codeThatShouldBeLower];
        }
    }

    if(isObject(response)
        && isObject(response.rate_response)
        && response.rate_response.hasOwnProperty('rates')) {

        response.rate_response.rates.forEach((rate, index) => {
            if(packageTypeWhitelist.indexOf(rate.package_type) > -1
                && serviceCodeWhitelist.indexOf(rate.service_code) > -1) {

                if(!lowestByCode.hasOwnProperty(rate.service_code)
                    || (isObject(lowestByCode[rate.service_code])
                    && rate.shipping_amount.amount < lowestByCode[rate.service_code].shipping_amount.amount)) {
                    lowestByCode[rate.service_code] = rate
                }
            }
        });

        doFinalTuning('usps_priority_mail', 'usps_parcel_select');
        doFinalTuning('fedex_2day', 'fedex_express_saver');

        forEach(lowestByCode, (obj, serviceCode) => {
            filtered.push(obj)
        });
    }

    return filtered;
}



/**
 * Calls the ShipEngine API to validate a shipping address
 */
async function validateAddress(request, h) {
    try {
        const { res, payload } = await wreck.post('/addresses/validate', { payload: helpers.makeArray(request.payload) });
        return h.apiSuccess(payload);
    }
    catch(err) {
        const error = new Error('ERROR VALIDATING SHIPPING ADDRESS: ' + getShipEngineErrorMessage(err));
        global.logger.error(error);
        global.bugsnag(error);
        throw Boom.badRequest(error);
    }
};


/**
 * Calls the ShipEngine API to get shipping rates
 */
async function rates(request, h) {
    try {
        const config = {
            shipment: {
                ship_from: {
                    name: process.env.SHIPPING_ADDRESS_FROM_NAME,
                    address_line1: process.env.SHIPPING_ADDRESS_FROM_ADDRESS1,
                    city_locality: process.env.SHIPPING_ADDRESS_FROM_CITY,
                    state_province: process.env.SHIPPING_ADDRESS_FROM_STATE,
                    postal_code: process.env.SHIPPING_ADDRESS_FROM_ZIP,
                    country_code: process.env.SHIPPING_ADDRESS_FROM_COUNTRY_CODE,
                    phone: process.env.SHIPPING_ADDRESS_FROM_PHONE
                },
                ...request.payload
            },
            rate_options: {
                carrier_ids: getCarrierIdsForCountry(request.payload.ship_to.country_code)
            }
        };

        const { res, payload } = await wreck.post('/rates', { payload: config });
        global.logger.info("SHIPPING RATES RESPONSE", payload);

        return h.apiSuccess(
            parseShippingRateResponse(payload)
        );
    }
    catch(err) {
        const error = new Error('ERROR GETTING SHIPPING RATES: ' + getShipEngineErrorMessage(err));
        global.logger.error(error);
        global.bugsnag(error);
        throw Boom.badRequest(error);
    }
};


async function createCustomsItemFromShoppingCart(ShoppingCart) {
    try {
        const cartJson = ShoppingCart.toJSON();
        const numCartItems = Array.isArray(cartJson.cart_items) ? cartJson.cart_items.length : 0;

        if(!numCartItems) {
            global.logger.error("In createCustomsItemFromShoppingCart", cartJson);
            throw new Error('Can not create customs item from Shopping Cart because the cart contains zero items')
        }

        global.logger.debug("In createCustomsItemFromShoppingCart", cartJson);

        if(cartJson.shipping_countryCodeAlpha2 !== 'US') {
            return await createCustomsItem({
                description: 'Clothing',
                quantity: numCartItems,
                net_weight: cartJson.product_weight_total,
                value_amount: numCartItems * 10, // total guess here: $10 * number of items?
                value_currency: 'USD',
                origin_country: 'US',
                metadata: `Cart ID ${cartJson.id}`,
                mass_unit: 'oz'  // see note #1 below
            });
        }
    }
    catch(err) {
        global.logger.error("CREATE PARCEL ERROR", err)
        throw err;
    }
}


/**
 * Creates a Shippo "Shipment" object based on the contents of the ShoppingCart.
 *
 * @param {*} ShoppingCart
 */
async function createShipmentFromShoppingCart(ShoppingCart) {
    global.logger.debug("In createShipmentFromShoppingCart", ShoppingCart.toJSON());

    let data = {
        async: false
    };

    data.address_to = {
        name: ShoppingCart.get('shipping_fullName'),
        company: ShoppingCart.get('shipping_company'),
        street1: ShoppingCart.get('shipping_streetAddress'),
        // street_no:,
        street2: ShoppingCart.get('shipping_extendedAddress'),
        // street3:
        city: ShoppingCart.get('shipping_city'),
        state: ShoppingCart.get('shipping_state'),
        zip: ShoppingCart.get('shipping_postalCode'),
        country: ShoppingCart.get('shipping_countryCodeAlpha2'),
        // phone: ,
        email: ShoppingCart.get('shipping_email'),
        // is_residential: ,
        validate: false,
        metadata: null
    };

    data.address_from = {
        name: process.env.SHIPPING_ADDRESS_FROM_NAME,
        company: 'BreadVan',
        street1: process.env.SHIPPING_ADDRESS_FROM_ADDRESS1,
        // street_no:,
        // street2:,
        // street3:
        city: process.env.SHIPPING_ADDRESS_FROM_CITY,
        state: process.env.SHIPPING_ADDRESS_FROM_STATE,
        zip: process.env.SHIPPING_ADDRESS_FROM_ZIP,
        country: process.env.SHIPPING_ADDRESS_FROM_COUNTRY_CODE,
        // phone: ,
        email: process.env.EMAIL_FROM_CART_SUCCESS,
        // is_residential: ,
        validate: false,
        metadata: null
    }

    data.parcels = await createParcelsFromShoppingCart(ShoppingCart);
    data.customs_declaration = await createCustomsItemFromShoppingCart(ShoppingCart);

    return await createShipment(data);
}


/**
 * Creates Shippo "Parcel" objects from the various items in a shopping cart
 * This will affect how much money the customer has to pay in shipping.
 * I'm guessing that tweaking this method over time will allow us to save postage
 * fees if we can calculate more accurately
 *
 * @param {*} ShoppingCart
 */
async function createParcelsFromShoppingCart(ShoppingCart) {
    const cartItems = ShoppingCart.related('cart_items');
    const PackageTypeCollection = await getPackageTypesModel().fetchAll();
    const shippingPackageTypes = {};

    if(cartItems) {
        let cartItemsJson = cartItems.toJSON();

        if(Array.isArray(cartItemsJson)) {
            cartItemsJson.forEach((cartItem) => {
                let PackageType = PackageTypeCollection.findWhere({type: cartItem.product.shipping_package_type});

                if(PackageType) {
                    let id = PackageType.get('id');

                    if(!shippingPackageTypes.hasOwnProperty(id)) {
                        shippingPackageTypes[id] = {
                            packageType: null,
                            totalWeight: 0
                        };
                    }

                    // The total the amount of weight for each package type needed.
                    // The weight includes the product weight plus the weight of the package material itself
                    shippingPackageTypes[id].packageType = PackageType;
                    shippingPackageTypes[id].totalWeight += parseFloat(PackageType.get('weight')) + parseFloat(cartItem.product.weight_oz || 5);
                }
            });

            // Create a Shippo "Parcel" object for every package type we have collected:
            const promises = [];
            forEach(shippingPackageTypes, async (obj) => {
                promises.push(
                    createParcel({
                        length: parseFloat(obj.packageType.get('length')),
                        width: parseFloat(obj.packageType.get('width')),
                        height: parseFloat(obj.packageType.get('height')) || 0.75,
                        distance_unit: obj.packageType.get('distance_unit'),
                        weight: obj.totalWeight,
                        mass_unit: 'oz'  // see note #1 below
                    })
                );
            });

            return await Promise.all(promises);
        }
    }
}

module.exports = {
    setServer,
    rates,
    validateAddress,
    getPackageTypesModel,
    getPackageTypeByAttribute,
    getPackageTypeSchema,
    createCustomsItemFromShoppingCart,
    createShipmentFromShoppingCart,
    createParcelsFromShoppingCart,

    // route handlers
    getPackageTypeByIdHandler,
    packageTypeCreateHandler,
    packageTypeUpdateHandler,
    packageTypeDeleteHandler,
    packageTypeListHandler,
    getShippingLabelHandler
}


/**
 * NOTES:
 *
 * 1) In order to have mass unit consistency with the product weight and she shipping package weight,
 *      I am forcing the 'oz' mass_unit so we can easily calculate the total weight of the package
 *      (product weight + package weight)
 */
