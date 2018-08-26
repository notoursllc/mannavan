const CoreService = require('../../server/plugins/core/core.service');

exports.up = function(knex, Promise) {
    return knex.schema.table(CoreService.DB_TABLES.carts, function(t) {
        t.timestamp('purchase_confirmation_email_sent_at', true).nullable();
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.table(CoreService.DB_TABLES.carts, function(t) {
        t.dropColumn('purchase_confirmation_email_sent_at');
    })
};
