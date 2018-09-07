const CoreService = require('../../server/plugins/core/core.service');


module.exports.up = (knex) => {
    return knex.schema.table(CoreService.DB_TABLES.payments, (t) => {
        t.dropColumn('transaction_id');
        t.dropColumn('success');
        t.dropColumn('void');
    });
};


module.exports.down = (knex) => {
    return knex.schema.table(CoreService.DB_TABLES.payments, function(t) {
        t.string('transaction_id');
        t.boolean('success');
        t.boolean('void');
    })
};
