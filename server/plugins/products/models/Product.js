const CoreService = require('../../core/core.service');

module.exports = function (baseModel, bookshelf) {
    return baseModel.extend(
        {
            tableName: CoreService.DB_TABLES.products,

            uuid: true,

            hasTimestamps: true,

            artist: function() {
                // product_artist_id is the foreign key in this model
                return this.belongsTo('ProductArtist', 'product_artist_id');
            },

            sizes: function() {
                // product_id is the foreign key in ProductSize
                return this.hasMany('ProductSize', 'product_id');
            },

            pics: function() {
                // product_id is the foreign key in ProductPic
                return this.hasMany('ProductPic', 'product_id');
            },

            cart_items: function() {
                // product_id is the foreign key in ShoppingCartItem
                return this.hasMany('ShoppingCartItem', 'product_id');
            },

            virtuals: {
                display_price: function() {
                    let price = 0;
                    let salePrice = this.get('sale_price') || 0;
                    let basePrice = this.get('base_price') || 0;

                    if(this.get('is_on_sale') && salePrice) {
                        price = salePrice;
                    }
                    else if(basePrice) {
                        price = basePrice;
                    }

                    return price;
                }
            }
        }
    );
};