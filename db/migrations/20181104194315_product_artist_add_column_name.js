const CoreService = require('../../server/plugins/core/core.service');

exports.up = function(knex, Promise) {
    return knex.schema.table(CoreService.DB_TABLES.product_artists, function(t) {
        t.string('name').nullable();
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.table(CoreService.DB_TABLES.product_artists, function(t) {
        t.dropColumn('name');
    })
};
