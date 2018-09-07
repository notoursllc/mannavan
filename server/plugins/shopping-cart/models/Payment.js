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
        },

        // Custom methods:
        {
            /**
             * A simple helper function to find by json property in the 'transaction' column
             * Only searches the top level attributes of the transaction json, so you'll need
             * to write your own code to search by any nested attributes.
             *
             * This is helpful:
             * https://gist.github.com/gerzhan/61a9d228caeb458d17e380aed8910531
             *
             * @param request
             * @returns {Promise}
             */
            findByTransactionAttribute: function(attrName, attrValue, fetchOptions) {
                return this.query((qb) => {
                    qb.where('transaction', '@>', `{"${attrName}": "${attrValue}"}`);  //https://stackoverflow.com/questions/27780117/bookshelf-js-where-with-json-column-postgresql#36876753
                }).fetch(fetchOptions);
            }
        }
    );
};
