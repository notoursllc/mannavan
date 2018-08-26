const CoreService = require('../../server/plugins/core/core.service');

exports.up = function(knex, Promise) {
    return knex.schema.table(CoreService.DB_TABLES.product_sizes, function(t) {
        t.decimal('weight_oz').defaultTo(0);
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.table(CoreService.DB_TABLES.product_sizes, function(t) {
        t.dropColumn('weight_oz');
    })
};
