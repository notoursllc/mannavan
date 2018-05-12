const CoreService = require('../../server/plugins/core/core.service');

module.exports.up = (knex) => {
    return knex.schema.createTable(
        CoreService.DB_TABLES.product_artists,
        (t) => {
            t.uuid('id').primary();
            t.text('description_short').nullable();
            t.text('description_long').nullable();
            t.string('icon').nullable();
            t.string('city').nullable();
            t.string('prov_state').nullable();
            t.string('country').nullable();
            t.string('email').nullable();
            t.timestamp('created_at', true).notNullable().defaultTo(knex.fn.now());
            t.timestamp('updated_at', true).nullable();

            t.index([
                'id'
            ]);
        }
    );
};


module.exports.down = (knex) => {
    return knex.schema.dropTableIfExists(CoreService.DB_TABLES.product_artists);
};