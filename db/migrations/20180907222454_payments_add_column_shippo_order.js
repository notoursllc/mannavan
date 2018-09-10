const CoreService = require('../../server/plugins/core/core.service');

exports.up = function(knex, Promise) {
    return knex.schema.table(CoreService.DB_TABLES.payments, (t) => {
        t.string('shippo_order_id').nullable();
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.table(CoreService.DB_TABLES.payments, (t) => {
        t.dropColumn('shippo_order_id');
    })
};
