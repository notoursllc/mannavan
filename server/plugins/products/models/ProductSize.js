const Joi = require('joi');
const CoreService = require('../../core/core.service');

module.exports = function (baseModel, bookshelf) {
    return baseModel.extend({
        tableName: CoreService.DB_TABLES.product_sizes,

        uuid: true,

        hasTimestamps: true,

        // http://bookshelfjs.org/#Model-instance-belongsTo
        // product_id is the foreign key in this model
        product: function() {
            return this.belongsTo('Product', 'product_id');
        },

        validate: {
            size: Joi.string().max(100),
            sort: Joi.number().integer().min(0),
            cost: Joi.number().precision(2).max(99999999.99),
            base_price: Joi.number().precision(2).max(99999999.99),
            sale_price: Joi.number().precision(2).max(99999999.99),
            is_on_sale: Joi.boolean(),
            is_visible: Joi.boolean(),
            inventory_count: Joi.number().integer().min(0),
            product_id: Joi.string().uuid()
        }
    });
};
