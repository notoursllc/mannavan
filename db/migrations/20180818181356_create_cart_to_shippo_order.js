'use strict';

const CoreService = require('../../server/plugins/core/core.service');


exports.up = function(knex, Promise) {
    return knex.schema.createTable(
        CoreService.DB_TABLES.cart_to_shippo_order,
        (t) => {
            t.uuid('id').primary();
            // Foreign Key:
            t.uuid('cart_id')
                .notNullable()
                .references('id')
                .inTable(CoreService.DB_TABLES.carts)
                .onDelete('CASCADE');
            t.jsonb('shippo_order').nullable();
            t.timestamp('created_at', true).notNullable().defaultTo(knex.fn.now());
            t.timestamp('updated_at', true).nullable();

            t.index([
                'cart_id'
            ]);
        }
    );
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExists(CoreService.DB_TABLES.cart_to_shippo_order);
};
