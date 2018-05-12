const CoreService = require('../../server/plugins/core/core.service');


module.exports.up = (knex) => {
    return knex.schema.createTable(
        CoreService.DB_TABLES.product_sizes,
        (t) => {
            t.uuid('id').primary();
            t.string('size').nullable();
            t.decimal('cost').nullable();
            t.decimal('base_price').nullable();
            t.decimal('sale_price').nullable();
            t.boolean('is_on_sale').defaultTo(false);
            t.integer('inventory_count').defaultTo(0);
            t.integer('sort').defaultTo(0);
            t.boolean('is_visible').defaultTo(false);
            t.timestamp('created_at', true).notNullable().defaultTo(knex.fn.now());
            t.timestamp('updated_at', true).nullable();

            // Foreign Keys:
            t.uuid('product_id')
                .notNullable()
                .references('id')
                .inTable(CoreService.DB_TABLES.products)
                .onDelete('CASCADE');

            t.index([
                'id',
                'product_id'
            ]);
        }
    );
};


module.exports.down = (knex) => {
    return knex.schema.dropTableIfExists(CoreService.DB_TABLES.product_sizes);
};
