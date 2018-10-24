const CoreService = require('../../server/plugins/core/core.service');

exports.up = function(knex, Promise) {
    return knex.schema.table(CoreService.DB_TABLES.products, function(t) {
        t.integer('material_type').nullable();
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.table(CoreService.DB_TABLES.products, function(t) {
        t.dropColumn('material_type');
    })
};
