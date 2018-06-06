const Joi = require('joi');
const path = require('path');
const productsController = require('./productsController');

let internals = {};
let routePrefix = '/api/v1';


internals.schema = {
    title: Joi.string().max(100),
    description_short: Joi.string().max(500).allow(null),
    description_long: Joi.string().max(750).allow(null),
    sku: Joi.string().max(50).allow(null),
    seo_uri: Joi.string().max(50).allow(null),
    cost: Joi.number().precision(2).min(0).max(99999999.99),
    weight_oz: Joi.number().precision(2).min(0).max(99999999.99),
    base_price: Joi.number().precision(2).min(0).max(99999999.99),
    sale_price: Joi.number().precision(2).min(0).max(99999999.99),
    is_on_sale: Joi.boolean(),
    is_available: Joi.boolean(),
    tax_code: Joi.number().allow(null),
    video_url: Joi.string().max(500).allow(null),
    gender: Joi.number().integer().positive(),
    type: Joi.number().integer().positive(),
    sub_type: Joi.number().integer().positive(),
    inventory_count: Joi.number().min(0),
    hide_if_out_of_stock: Joi.boolean(),
    product_artist_id: Joi.string().uuid().allow(null),
    created_at: Joi.date().optional(),
    updated_at: Joi.date().optional()
};


internals.productPicSchema = {
    id: Joi.string().uuid(),
    sort_order: Joi.number().integer().min(0),
    is_visible: Joi.boolean(),
    product_id: Joi.string().uuid()
};


internals.after = function (server, next) {

    // Yes this was aleady set in the Core plugin, but apparently
    // it must be set in every plugin that needs a view engine:
    // https://github.com/hapijs/vision/issues/94
    server.views({
        engines: {
            html: require('handlebars')
        },
        // path: path.resolve(__dirname, '../../..')
        path: path.resolve(__dirname, '../../../dist')
        // path: '../../../dist/views',
        // partialsPath: '../../views/partials',
        // relativeTo: __dirname // process.cwd() // prefer this over __dirname when compiling to dist/cjs and using rollup
    });

    server.route([
        {
            method: 'GET',
            path: `${routePrefix}/product`,
            config: {
                description: 'Finds a product by ID',
                validate: {
                    query: {
                        id: Joi.string().uuid(),
                        viewAllRelated: Joi.boolean().optional()
                    }
                },
                handler: productsController.getProductByIdHandler
            }
        },
        {
            method: 'GET',
            path: '/product/share',  // NOTE: no routePrefix on this one
            config: {
                auth: false,
                validate: {
                    query: {
                        uri: Joi.string()
                    }
                }
            },
            handler: productsController.productShareHandler
        },
        {
            method: 'GET',
            path: `${routePrefix}/product/seo`,
            config: {
                description: 'Finds a product by it\'s seo uri',
                validate: {
                    query: {
                        id: Joi.string().max(100)
                    }
                },
                handler: productsController.productSeoHandler
            }
        },
        {
            method: 'GET',
            path: `${routePrefix}/product/info`,
            config: {
                description: 'Returns general info about products',
                handler: productsController.productInfoHandler
            }
        },
        {
            method: 'GET',
            path: `${routePrefix}/products`,
            config: {
                description: 'Gets a list of products',
                handler: productsController.getProductsHandler
            }
        },
        {
            method: 'POST',
            path: `${routePrefix}/product/create`,
            config: {
                description: 'Updates a product',
                validate: {
                    payload: Joi.object({
                        ...internals.schema
                    })
                },
                handler: productsController.productCreateHandler
            }
        },
        {
            method: 'POST',
            path: `${routePrefix}/product/update`,
            config: {
                description: 'Updates a product',
                validate: {
                    payload: Joi.object({
                        id: Joi.string().uuid().required(),
                        ...internals.schema
                    })
                },
                handler: productsController.productUpdateHandler
            }
        },

        // Product size
        {
            method: 'POST',
            path: `${routePrefix}/product/size/create`,
            config: {
                description: 'Adds a new size to the product',
                handler: productsController.productSizeCreateHandler
            }
        },
        {
            method: 'POST',
            path: `${routePrefix}/product/size/update`,
            config: {
                description: 'Updates a product size',
                handler: productsController.productSizeUpdateHandler
            }
        },
        {
            method: 'POST',
            path: `${routePrefix}/product/size/delete`,
            config: {
                description: 'Deletes a product size',
                validate: {
                    payload: {
                        id: Joi.string().uuid()
                    }
                },
                handler: productsController.productSizeDeleteHandler
            }
        },

        // Product pictures
        {
            method: 'POST',
            path: `${routePrefix}/product/pic/upsert`,
            config: {
                description: 'Adds a new picture to the product',
                payload: {
                    output: 'stream',
                    parse: true,
                    allow: 'multipart/form-data',
                    maxBytes: 7 * 1000 * 1000  // 7MB
                },
                validate: {
                    payload: {
                        file: Joi.object(),
                        ...internals.productPicSchema
                    }
                },
                handler: productsController.productPicUpsertHandler
            }
        },
        {
            method: 'POST',
            path: `${routePrefix}/product/pic/delete`,
            config: {
                description: 'Deletes a product picture',
                validate: {
                    payload: {
                        id: Joi.string().uuid()
                    }
                },
                handler: productsController.productPicDeleteHandler
            }
        }
    ]);


    // LOADING BOOKSHELF MODELS:
    let baseModel = require('bookshelf-modelbase')(server.app.bookshelf);

    server.app.bookshelf.model(
        'Product',
        require('./models/Product')(baseModel, server.app.bookshelf, server)
    );

    server.app.bookshelf.model(
        'ProductArtist',
        require('./models/ProductArtist')(baseModel, server.app.bookshelf, server)
    );

    server.app.bookshelf.model(
        'ProductPic',
        require('./models/ProductPic')(baseModel, server.app.bookshelf, server)
    );

    server.app.bookshelf.model(
        'ProductPicVariant',
        require('./models/ProductPicVariant')(baseModel, server.app.bookshelf, server)
    );

    server.app.bookshelf.model(
        'ProductSize',
        require('./models/ProductSize')(baseModel, server.app.bookshelf, server)
    );

    return next();
};


exports.register = (server, options, next) => {
    productsController.setServer(server);

    server.dependency(['BookshelfOrm', 'Core'], internals.after);
    return next();
};

exports.register.attributes = require('./package.json');
