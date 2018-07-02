const CoreService = require('../../server/plugins/core/core.service');


module.exports.up = (knex) => {
    return knex.schema.createTable(
        CoreService.DB_TABLES.carts,
        (t) => {
            t.uuid('id').primary();
            t.string('token').nullable();
            t.string('billing_firstName').nullable();
            t.string('billing_lastName').nullable();
            t.string('billing_company').nullable();
            t.string('billing_streetAddress').nullable();
            t.string('billing_extendedAddress').nullable();
            t.string('billing_city').nullable();
            t.string('billing_state').nullable();
            t.string('billing_postalCode').nullable();
            t.string('billing_countryCodeAlpha2').nullable();
            t.string('billing_phone').nullable();
            t.string('shipping_firstName').nullable();
            t.string('shipping_lastName').nullable();
            t.string('shipping_streetAddress').nullable();
            t.string('shipping_extendedAddress').nullable();
            t.string('shipping_company').nullable();
            t.string('shipping_city').nullable();
            t.string('shipping_state').nullable();
            t.string('shipping_postalCode').nullable();
            t.string('shipping_countryCodeAlpha2').nullable();
            t.string('shipping_email').nullable();
            t.decimal('shipping_total').nullable();
            t.decimal('sales_tax').nullable();
            t.string('status').nullable();
            t.timestamp('created_at', true).notNullable().defaultTo(knex.fn.now());
            t.timestamp('updated_at', true).nullable();
            t.timestamp('closed_at', true).nullable();

            // Foreign Keys:
            t.uuid('customer_id')
                .references('id')
                .inTable(CoreService.DB_TABLES.customers)
                .onDelete('CASCADE');

            t.index([
                'id',
                'customer_id'
            ]);
        }
    );
};


module.exports.down = (knex) => {
    return knex.schema.dropTableIfExists(CoreService.DB_TABLES.carts);
};
