'use strict';

const Promise = require('bluebird');
const ShoppingCartService = require('./ShoppingCartService');
const ProductService = require('../../products/services/ProductService');
const BaseService = require('../../core/services/BaseService');

module.exports = class ShoppingCartItemService extends BaseService {

    constructor(server) {
        super(server, 'ShoppingCartItem')
        this.shoppingCartService = new ShoppingCartService(server);
        this.productService = new ProductService(server);
    }


    addItem(request) {
        let self = this;

        return new Promise((resolve, reject) => {
            Promise
                .all([
                    this.productService.getProductByAttribute('id', request.payload.id),
                    self.shoppingCartService.findOrCreateCart(request)
                ])
                .then((results) => {
                    let Product = results[0];
                    let ShoppingCart = results[1];

                    let qty = request.payload.options.qty || 1;
                    let shoppingCartId = ShoppingCart.get('id');
                    let productId = Product.get('id');

                    // Shopping Cart doesn't have any items yet.
                    // Create a new cart item
                    if(Object.keys(ShoppingCart.relations).length === 0) {
                        return createCartItem();
                    }
                    // Determine if we simply need to update the qty of an existing item
                    // or add a new one
                    else {
                        return self.getModel()
                            .findByVariant(shoppingCartId, productId, 'size', request.payload.options.size)
                            .then((ShoppingCartItem) => {
                                // No matching variants.
                                // Create a new cart item
                                if(!ShoppingCartItem) {
                                    return createCartItem();
                                }
                                else {
                                    // Item with matching variants is already in the cart.
                                    // Just need to update the qty
                                    return ShoppingCartItem.save(
                                        { qty: parseInt(ShoppingCartItem.get('qty') + qty, 10) },
                                        { method: 'update', patch: true }
                                    );
                                }
                            });
                    }

                    // NOTE: knex.js requires use of JSON.stringify() for json values
                    // http://knexjs.org/#Schema-json
                    function createCartItem() {
                        return self.getModel()
                            .create({
                                qty: qty,
                                variants: JSON.stringify({
                                    size: request.payload.options.size
                                }),
                                cart_id: shoppingCartId,
                                product_id: productId
                            });
                    }
                })
                .then(resolve)
                .catch((err) => {
                    global.logger.error(err);
                    global.bugsnag(err);
                    reject(err);
                });
        });
    }

}