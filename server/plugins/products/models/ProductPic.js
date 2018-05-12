const CoreService = require('../../core/core.service');

module.exports = function (baseModel, bookshelf) {
    return baseModel.extend(
        {
            tableName: CoreService.DB_TABLES.product_pics,

            uuid: true,

            hasTimestamps: true,

            // One-to-One relation with Product
            // product_id is the foreign key in this model
            product: function() {
                return this.belongsTo('Product', 'product_id');
            },

            pic_variants: function() {
                // product_pic_id is the foreign key in ProductPicVariant
                return this.hasMany('ProductPicVariant', 'product_pic_id');
            }
        },

        // Custom methods:
        {

        }
    );
};
