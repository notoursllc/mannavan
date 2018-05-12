'use strict';

const CoreService = require('../../core/core.service');

module.exports = function (baseModel, bookshelf) {
    return baseModel.extend(
        {
            tableName: CoreService.DB_TABLES.payments,

            uuid: true,

            hasTimestamps: true,

            // One payment per shopping cart
            // http://bookshelfjs.org/#Model-instance-belongsTo
            shoppingCart: function() {
                return this.belongsTo('ShoppingCart', 'cart_id');
            }
        }
    );
};
