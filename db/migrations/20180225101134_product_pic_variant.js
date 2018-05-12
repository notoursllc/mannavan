const CoreService = require('../../server/plugins/core/core.service');

exports.up = function(knex, Promise) {
    return knex.schema.createTable(
        CoreService.DB_TABLES.product_pic_variants,
        (t) => {
            t.uuid('id').primary();
            t.string('url').nullable();
            t.integer('width');
            t.integer('height');
            t.boolean('is_visible').defaultTo(true);
            t.timestamp('created_at', true).notNullable().defaultTo(knex.fn.now());
            t.timestamp('updated_at', true).nullable();

            // Foreign Keys:
            t.uuid('product_pic_id')
                .notNullable()
                .references('id')
                .inTable(CoreService.DB_TABLES.product_pics)
                .onDelete('CASCADE');

            t.index([
                'id',
                'product_pic_id'
            ]);
        }
    );
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists(CoreService.DB_TABLES.product_pic_variants);
};