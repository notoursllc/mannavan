'use strict';

const Wreck = require('wreck');
const Promise = require('bluebird');
const isObject = require('lodash.isobject');
const forEach = require('lodash.foreach');
const helpers = require('../../../helpers.service.js');


const wreck = Wreck.defaults({
    baseUrl: 'https://api.shipengine.com/v1',
    json: true,
    headers: {
        'api-key': process.env.SHIPENGINE_API_KEY_PROD,
        'Content-Type': 'application/json'
    }
});


module.exports = class ShippingService {

    getShipEngineErrorMessage(err) {
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


    validateAddress(address) {
        let self = this;

        return new Promise((resolve, reject) => {
            wreck.post(
                '/addresses/validate',
                { payload: helpers.makeArray(address) },
                (err, res, payload) => {
                    if(err) {
                        return reject(new Error('ERROR VALIDATING SHIPPING ADDRESS: ' + self.getShipEngineErrorMessage(err)));
                    }
    
                    return resolve(payload);
                }
            );
        });
    }


    getShippingRates(config) {
        let self = this;

        return new Promise((resolve, reject) => {
            wreck.post(
                '/rates',
                { payload: config },
                (err, res, payload) => {
                    if(err) {
                        return reject(new Error('ERROR GETTING SHIPPING RATES: ' + self.getShipEngineErrorMessage(err)));
                    }
    
                    return resolve(payload);
                }
            );
        });
    }


    /**
     * Returns an array of ShipEngine carrier ID's for a given 2 character country code
     * Note USPS does ship internationally:  https://www.usps.com/international/international-how-to.htm
     * 
     * @param string countryCode 
     * @returns []
     */
    getCarrierIdsForCountry(countryCode) {
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


    parseShippingRateResponse(response) {
        return new Promise((resolve, reject) => {
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
    
            if(isObject(response) && isObject(response.rate_response) && response.rate_response.hasOwnProperty('rates')) {
                response.rate_response.rates.forEach((rate, index) => {
                    if(packageTypeWhitelist.indexOf(rate.package_type) > -1
                        && serviceCodeWhitelist.indexOf(rate.service_code) > -1) {
                        
                        if(!lowestByCode.hasOwnProperty(rate.service_code) 
                            || (isObject(lowestByCode[rate.service_code]) && rate.shipping_amount.amount < lowestByCode[rate.service_code].shipping_amount.amount)) {
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
    
            resolve(filtered);
        });
    }

}