'use strict';

const CoreService = require('../../core/core.service');

module.exports = function (baseModel, bookshelf) {
    return baseModel.extend(
        {
            tableName: CoreService.DB_TABLES.cart_to_shippo_order,

            uuid: true,

            hasTimestamps: true,

            // One Shippo Order per shopping cart
            // http://bookshelfjs.org/#Model-instance-belongsTo
            shoppingCart: function() {
                return this.belongsTo('ShoppingCart', 'cart_id');
            }
        }
    );
};
