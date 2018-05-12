const CoreService = require('../../core/core.service');

module.exports = function (baseModel, bookshelf) {
    return baseModel.extend(
        {
            tableName: CoreService.DB_TABLES.product_pic_variants,

            uuid: true,

            hasTimestamps: true,

            // http://bookshelfjs.org/#Model-instance-belongsTo
            // product_pic_id is the foreign key in this model
            product_pic: function() {
                return this.belongsTo('ProductPic', 'product_pic_id');
            }
        }
    );
};
