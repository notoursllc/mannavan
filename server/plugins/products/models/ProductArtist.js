const CoreService = require('../../core/core.service');

module.exports = function (baseModel, bookshelf) {
    return baseModel.extend({
        tableName: CoreService.DB_TABLES.product_artists,

        uuid: true,

        hasTimestamps: true,

        // http://bookshelfjs.org/#Model-instance-hasMany
        products: function() {
            return this.hasMany('Product', 'product_artist_id');
        }
    });
};
