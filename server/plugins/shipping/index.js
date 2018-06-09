const Joi = require('joi');
const ShippingController = require('./shippingController');


exports.plugin = {
    once: true,
    pkg: require('./package.json'),
    register: function (server, options) {
        server.route([
            {
                method: 'POST',
                path: '/shipping/validateAddress',
                options: {
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
                    handler: ShippingController.validateAddress
                }
            },
            {
                method: 'POST',
                path: '/shipping/rates',
                options: {
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
                    handler: ShippingController.rates
                }
            }
        ]);
    }
};
