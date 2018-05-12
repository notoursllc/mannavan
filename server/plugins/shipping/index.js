const Joi = require('joi');
const Boom = require('boom');
const ShippingService = require('./services/ShippingService');

const shippingService = new ShippingService();
let internals = {};


exports.register = (server, options, next) => {

    /************************************
     * ROUTE HANDLERS
     ************************************/

    internals.validateAddress = (request, reply) => {
        shippingService
            .validateAddress(request.payload)
            .then((response) => {
                //TODO - get value from response
                reply.apiSuccess(response);
            })
            .catch((err) => {
                global.logger.error(err);
                global.bugsnag(err);
                reply(Boom.badRequest(err));
            });
    };


    internals.rates = (request, reply) => {
        shippingService
            .getShippingRates({
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
                    carrier_ids: shippingService.getCarrierIdsForCountry(request.payload.ship_to.country_code)
                }
            })
            .then((response) => {
                shippingService.parseShippingRateResponse(response).then((filtered) => {
                    reply.apiSuccess(filtered);
                });
            })
            .catch((err) => {
                global.logger.error(err);
                global.bugsnag(err);
                reply(Boom.badRequest(err));
            });
    };


    server.route([
        {
            method: 'POST',
            path: '/shipping/validateAddress',
            config: {
                description: 'Validates an address',
                validate: {
                    payload: {
                        name: Joi.string(),
                        company_name: Joi.string().allow(null),
                        address_line1: Joi.string().required(),
                        address_line2: Joi.string().allow(''),
                        address_line3: Joi.string().allow(''),
                        city_locality: Joi.string().required(),
                        state_province: Joi.string().required(),
                        postal_code: Joi.string().required(),
                        country_code: Joi.string().max(3).regex(/^[A-z]+$/).required()
                    }
                },
                handler: internals.validateAddress 
            }
        },
        {
            method: 'POST',
            path: '/shipping/rates',
            config: {
                description: 'Returns shipping rates',
                validate: {
                    payload: {
                        validate_address: Joi.string().required(),
                        ship_to: Joi.object().keys({
                            name: Joi.string().optional(),
                            company_name: Joi.string().allow(''),
                            address_line1: Joi.string().required(),
                            address_line2: Joi.string().allow(''),
                            address_line3: Joi.string().allow(''),
                            city_locality: Joi.string().required(),
                            state_province: Joi.string().required(),
                            postal_code: Joi.string().required(),
                            country_code: Joi.string().max(3).regex(/^[A-z]+$/).required()
                        }),
                        packages: Joi.array().items(
                            Joi.object().keys({
                                weight: Joi.object().keys({
                                    value: Joi.number().precision(3).required(),
                                    unit: Joi.string().required()
                                })
                            })
                        )
                    }
                },
                handler: internals.rates
            }
        }
    ]);

    return next();
};

exports.register.attributes = require('./package.json');