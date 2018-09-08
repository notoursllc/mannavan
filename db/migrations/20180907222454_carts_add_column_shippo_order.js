const CoreService = require('../../server/plugins/core/core.service');

exports.up = function(knex, Promise) {
    return knex.schema.table(CoreService.DB_TABLES.carts, function(t) {
        t.jsonb('shippo_order').nullable();
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.table(CoreService.DB_TABLES.carts, function(t) {
        t.dropColumn('shippo_order');
    })
};
