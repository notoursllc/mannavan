const CoreService = require('../../server/plugins/core/core.service');


module.exports.up = (knex) => {
    return knex.schema.createTable(
        CoreService.DB_TABLES.customers,
        (t) => {
            t.uuid('id').primary();
            t.string('first_name');
            t.string('last_name').nullable();
            t.string('company').nullable();
            t.string('email').nullable();
            t.string('phone').nullable();
            t.string('fax').nullable();
            t.string('website').nullable();
            t.timestamp('created_at', true).notNullable().defaultTo(knex.fn.now());
            t.timestamp('updated_at', true).nullable();
            t.timestamp('deleted_at', true).nullable();

            t.index([
                'id'
            ]);
        }
    );
};


module.exports.down = (knex) => {
    return knex.schema.dropTableIfExists(CoreService.DB_TABLES.customers);
};