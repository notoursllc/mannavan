'use strict';

const CoreService = require('../../core/core.service');

module.exports = function (baseModel, bookshelf) {
    return baseModel.extend({
        tableName: CoreService.DB_TABLES.customers,

        uuid: true,

        hasTimestamps: true,

        virtuals: {
            full_name: function() {
                return this.get('first_name') + ' ' + this.get('last_name');
            }
        },

        // Customers can have many shopping carts
        // http://bookshelfjs.org/#Model-instance-hasMany
        shoppingCarts: function() {
            return this.hasMany('ShoppingCart', 'customer_id');
        }
    });
};
