const Joi = require('joi');
const Boom = require('boom');
const path = require('path');
const isObject = require('lodash.isobject');
const HelperService = require('../../helpers.service');
const ProductService = require('./services/ProductService');
const ProductPicService = require('./services/ProductPicService');
const ProductSizeService = require('./services/ProductSizeService');


let productService;
let productPicService;
let productSizeService;

let internals = {};
let routePrefix = '/api/v1';


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


    /************************************
     * ROUTE HANDLERS
     ************************************/
    internals.productShare = (request, reply) => {
        let uriParts = request.query.uri.split('/');
        let seoUri = uriParts[uriParts.length - 1];

        productService
            .getProductByAttribute('seo_uri', seoUri)
            .then((product) => {
                let p = isObject(product) ? product.toJSON() : {};
                let urlImages = 'https://www.gmnst.com/images/';
                let featuredPic = productService.featuredProductPic(p);

                return reply.view('views/socialshare', {
                    title: p.title || 'Welcome to Gmnst.com',
                    description: p.description_short || '',
                    image: featuredPic ? `${urlImages}product/${featuredPic}` : `${urlImages}logo_header.png`,
                    url: `https://www.gmnst.com/${request.query.uri}`
                });
            })
            .catch((err) => {
                global.logger.error(err);
                global.bugsnag(err);
                reply(Boom.badRequest(err));
            });
    };


    internals.productRoute = (request, reply) => {
        return productService
            .getModel()
            .forge({ id: request.query.id })
            .fetch({
                withRelated: productService.getWithRelated(request.query)
            })
            .then((products) => {
                reply.apiSuccess(products);
            })
            .catch((err) => {
                global.logger.error(err);
                global.bugsnag(err);
                reply(Boom.badRequest(err));
            });
    };


    internals.productSeo = (request, reply) => {
        let withRelated = productService.getWithRelated();
        withRelated.push('pics.pic_variants');

        productService
            .getModel()
            .forge({
                'seo_uri': request.query.id
            })
            .fetch({
                withRelated
            })
            .then((products) => {
                reply.apiSuccess(products);
            })
            .catch((err) => {
                global.logger.error(err);
                global.bugsnag(err);
                reply(Boom.badRequest(err));
            });
    };


    internals.productInfo = (request, reply) => {
        reply.apiSuccess({
            types: productService.getProductTypes(),
            subTypes: productService.getProductSubTypes(),
            sizes: productService.getSizeTypes(),
            genders: productService.getGenderTypes()
        });
    };


    internals.productsRoute = (request, reply) => {
        HelperService
            .fetchPage(
                request,
                productService.getModel(),
                productService.getWithRelated()
            )
            .then((products) => {
                reply.apiSuccess(products, products.pagination);
            })
            .catch((err) => {
                global.logger.error(err);
                global.bugsnag(err);
                reply(Boom.notFound(err));
            });
    };


    internals.productCreate = (request, reply) => {
        productService
            .getModel()
            .create(request.payload)
            .then((Product) => {
                if(!Product) {
                    reply(Boom.badRequest('Unable to create product.'));
                    return;
                }

                reply.apiSuccess(Product.toJSON());
            })
            .catch((err) => {
                global.logger.error(err);
                global.bugsnag(err);
                reply(Boom.badRequest(err));
            });
    };


    internals.productUpdate = (request, reply) => {
        request.payload.updated_at = request.payload.updated_at || new Date();

        productService
            .getModel()
            .update(request.payload, { id: request.payload.id })
            .then((Product) => {
                if(!Product) {
                    reply(Boom.badRequest('Unable to find product.'));
                    return;
                }

                reply.apiSuccess(Product.toJSON());
            })
            .catch((err) => {
                global.logger.error(err);
                global.bugsnag(err);
                reply(Boom.badRequest(err));
            });
    };


    /***************************************
     * Product size route handlers
     /**************************************/
    internals.productSizeCreate = (request, reply) => {
        request.payload.sort = request.payload.sort || productService.getSizeTypeSortOrder(request.payload.size)

        productSizeService
            .getModel()
            .create(request.payload)
            .then((ProductSize) => {
                if(!ProductSize) {
                    reply(Boom.badRequest('Unable to createa a new product size.'));
                    return;
                }

                reply.apiSuccess(ProductSize.toJSON());
            })
            .catch((err) => {
                global.logger.error(err);
                global.bugsnag(err);
                reply(Boom.badRequest(err));
            });
    };


    internals.productSizeUpdate = (request, reply) => {
        request.payload.updated_at = request.payload.updated_at || new Date();

        productSizeService
            .getModel()
            .update(request.payload, { id: request.payload.id })
            .then((ProductSize) => {
                if(!ProductSize) {
                    reply(Boom.badRequest('Unable to find product size.'));
                    return;
                }

                reply.apiSuccess(ProductSize.toJSON());
            })
            .catch((err) => {
                global.logger.error(err);
                global.bugsnag(err);
                reply(Boom.badRequest(err));
            });
    };


    internals.productSizeDelete = (request, reply) => {
        request.payload.updated_at = request.payload.updated_at || new Date();

        productSizeService
            .getModel()
            .destroy({ id: request.payload.id })
            .then((ProductSize) => {
                if(!ProductSize) {
                    reply(Boom.badRequest('Unable to find product size.'));
                    return;
                }

                reply.apiSuccess(ProductSize.toJSON());
            })
            .catch((err) => {
                global.logger.error(err);
                global.bugsnag(err);
                reply(Boom.badRequest(err));
            });
    };


    /***************************************
     * Product picture route handlers
     /**************************************/
    internals.productPicUpsert = (request, reply) => {
        productPicService
            .upsertProductPic(request)
            .then((productPicId) => {
                if(!productPicId) {
                    reply(Boom.badRequest('Unable to create a a new product picture.'));
                    return;
                }

                global.logger.info(
                    request.payload.id ? 'PRODUCT PIC - DB UPDATED' : 'PRODUCT PIC - DB CREATED',
                    productPicId
                );

                reply.apiSuccess({
                    product_pic_id: productPicId
                });
            })
            .catch((err) => {
                global.logger.error(err);
                global.bugsnag(err);
                reply(Boom.badRequest(err));
            });
    };


    internals.productPicDelete = (request, reply) => {
        request.payload.updated_at = request.payload.updated_at || new Date();

        productPicService
            .unlinkFileAndVariants(request.payload.id)
            .catch((err) => {
                // just dropping the exception beacuse issues deleting the file
                // shouldn't stop this process from continuing
            })
            .then((ProductPic) => {
                //TODO: Get the product.  If this is the featured pic, assign a new one on the product

                // Delete from DB:
                return productPicService.getModel().destroy({ id: request.payload.id })
            })
            .then((ProductPic) => {
                global.logger.info('DELETE FILE PRODUCT PIC SHOULD HAVE VARIANTS', ProductPic.toJSON())
                global.logger.info('PRODUCT PIC - DB DELETED2', request.payload.id);
                reply.apiSuccess({
                    id: request.payload.id
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
                handler: internals.productRoute
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
            handler: internals.productShare
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
                handler: internals.productSeo
            }
        },
        {
            method: 'GET',
            path: `${routePrefix}/product/info`,
            config: {
                description: 'Returns general info about products',
                handler: internals.productInfo
            }
        },
        {
            method: 'GET',
            path: `${routePrefix}/products`,
            config: {
                description: 'Gets a list of products',
                handler: internals.productsRoute
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
                handler: internals.productCreate
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
                handler: internals.productUpdate
            }
        },

        // Product size
        {
            method: 'POST',
            path: `${routePrefix}/product/size/create`,
            config: {
                description: 'Adds a new size to the product',
                handler: internals.productSizeCreate
            }
        },
        {
            method: 'POST',
            path: `${routePrefix}/product/size/update`,
            config: {
                description: 'Updates a product size',
                handler: internals.productSizeUpdate
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
                handler: internals.productSizeDelete
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
                handler: internals.productPicUpsert
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
                handler: internals.productPicDelete
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
    productService = new ProductService(server);
    productPicService = new ProductPicService(server);
    productSizeService = new ProductSizeService(server);

    server.dependency(['BookshelfOrm', 'Core'], internals.after);
    return next();
};

exports.register.attributes = require('./package.json');
