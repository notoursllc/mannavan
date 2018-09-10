const Joi = require('joi');
const ShippingController = require('./shippingController');


const after = function (server) {
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
            method: 'GET',
            path: '/shipping/packagetype',
            options: {
                description: 'Finds a package type by ID',
                validate: {
                    query: {
                        id: Joi.string().uuid()
                    }
                },
                handler: ShippingController.getPackageTypeByIdHandler
            }
        },
        {
            method: 'GET',
            path: `/shipping/packagetypes`,
            options: {
                description: 'Gets a list of package types',
                handler: ShippingController.packageTypeListHandler
            }
        },
        {
            method: 'POST',
            path: `/shipping/packagetype/create`,
            options: {
                description: 'Creates a package type',
                validate: {
                    payload: Joi.object({
                        ...ShippingController.getPackageTypeSchema()
                    })
                },
                handler: ShippingController.packageTypeCreateHandler
            }
        },
        {
            method: 'POST',
            path: `/shipping/packagetype/update`,
            options: {
                description: 'Updates a package type',
                validate: {
                    payload: Joi.object({
                        id: Joi.string().uuid().required(),
                        ...ShippingController.getPackageTypeSchema()
                    })
                },
                handler: ShippingController.packageTypeUpdateHandler
            }
        },
        {
            method: 'DELETE',
            path: `/shipping/packagetype`,
            options: {
                description: 'Deletes a package type',
                validate: {
                    query: Joi.object({
                        id: Joi.string().uuid().required(),
                    })
                },
                handler: ShippingController.packageTypeDeleteHandler
            }
        },
        {
            method: 'POST',
            path: '/shipping/label',
            options: {
                description: 'For downloading a shipping label',
                validate: {
                    payload: Joi.object({
                        id: Joi.string().required(),
                    })
                },
                handler: ShippingController.getShippingLabelHandler
            }
        }
    ]);

    // LOADING BOOKSHELF MODELS:
    let baseModel = require('bookshelf-modelbase')(server.app.bookshelf);

    server.app.bookshelf.model(
        'PackageTypes',
        require('./models/PackageTypes')(baseModel, server.app.bookshelf, server)
    );
};


exports.plugin = {
    once: true,
    pkg: require('./package.json'),
    register: function (server, options) {
        ShippingController.setServer(server);

        server.dependency(['BookshelfOrm', 'Core'], after);
    }
};
