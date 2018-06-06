'use strict';

const Wreck = require('wreck');
const Boom = require('boom');
const isObject = require('lodash.isobject');
const forEach = require('lodash.foreach');
const helpers = require('../../helpers.service');

const wreck = Wreck.defaults({
    baseUrl: 'https://api.shipengine.com/v1',
    json: true,
    headers: {
        'api-key': process.env.SHIPENGINE_API_KEY_PROD,
        'Content-Type': 'application/json'
    }
});

const internals = {};



internals.getShipEngineErrorMessage = (err) => {
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
internals.getCarrierIdsForCountry = (countryCode) => {
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


internals.parseShippingRateResponse = (response) => {
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
exports.validateAddress = async (request, reply) => {
    try {
        const { res, payload } = await wreck.post('/addresses/validate', { payload: helpers.makeArray(request.payload) });
        reply.apiSuccess(payload);
    }
    catch(err) {
        const error = new Error('ERROR VALIDATING SHIPPING ADDRESS: ' + internals.getShipEngineErrorMessage(err));
        global.logger.error(error);
        global.bugsnag(error);
        reply(Boom.badRequest(error));
    }
};


/**
 * Calls the ShipEngine API to get shipping rates
 */
exports.rates = async (request, reply) => {
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
                carrier_ids: internals.getCarrierIdsForCountry(request.payload.ship_to.country_code)
            }
        };

        const { res, payload } = await wreck.post('/rates', { payload: config });
        reply.apiSuccess(
            internals.parseShippingRateResponse(payload)
        );
    }
    catch(err) {
        const error = new Error('ERROR GETTING SHIPPING RATES: ' + internals.getShipEngineErrorMessage(err));
        global.logger.error(error);
        global.bugsnag(error);
        reply(Boom.badRequest(error));
    }
};
