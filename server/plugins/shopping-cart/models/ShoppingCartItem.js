const CoreService = require('../../core/core.service');
const accounting = require('accounting');


module.exports = function (baseModel, bookshelf) {
    return baseModel.extend(
        {
            tableName: CoreService.DB_TABLES.cart_items,
            
            uuid: true,
    
            hasTimestamps: true,
    
            // One-to-One relation with ShoppingCart
            // cart_id is the foreign key in this model
            cart: function() {
                return this.belongsTo('ShoppingCart', 'cart_id');
            },
    
            // One-to-One relation with ShoppingCart
            // product_id is the foreign key in this model
            product: function() {
                return this.belongsTo('Product', 'product_id');
            },

            virtuals: {
                total_item_price: function() {
                    let val = this.get('qty') * this.related('product').get('display_price');
                    return accounting.toFixed(val, 2);
                }
            }
        },
    
        // Custom methods:
        {
            /**
             * A simple helper function to find by json property in the 'variant' column
             * Only searches the top level attributes of the variant json, so you'll need
             * to write your own code to search by any nested attributes.
             *
             * This is helpful:
             * https://gist.github.com/gerzhan/61a9d228caeb458d17e380aed8910531
             *
             * @param request
             * @returns {Promise}
             */
            findByVariant: function(cart_id, product_id, variantName, variantValue) {
                return this.query((qb) => {
                    qb.where('cart_id', '=', cart_id);
                    qb.andWhere('product_id', '=', product_id);
                    qb.andWhere('variants', '@>', `{"${variantName}": "${variantValue}"}`);  //https://stackoverflow.com/questions/27780117/bookshelf-js-where-with-json-column-postgresql#36876753
                }).fetch();
            }
        });
};
