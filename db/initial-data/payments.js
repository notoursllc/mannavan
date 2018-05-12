'use strict';

const Promise = require('bluebird');
const faker = require('faker');
const CoreService = require('../../server/plugins/core/core.service');


exports.seed = (knex) => {
    return knex(CoreService.DB_TABLES.payments)
        .del()
        // .then(() => {
        //     return knex.raw(`ALTER SEQUENCE ${CoreService.DB_TABLES.product_pics}_id_seq RESTART WITH 1`);
        // })
        .then(() => {
            let promises = [];
            let d = new Date();

            // Adding just enough data to help with automated tests
            promises.push(
                knex(CoreService.DB_TABLES.payments)
                    .insert({
                        id: faker.random.uuid(),
                        transaction_id: 'abc1',
                        transaction: {
                            "paymentInstrumentType": "credit_card",
                            "creditCard": {
                                "cardType": "Visa",
                                "last4": "1111"
                            }
                        },
                        success: true,
                        created_at: d,
                        updated_at: d,
                        cart_id: global.cartSeedUuids[0]
                    })
            )

            promises.push(
                knex(CoreService.DB_TABLES.payments)
                    .insert({
                        id: faker.random.uuid(),
                        transaction_id: 'abc2',
                        transaction: {
                            "paymentInstrumentType": "paypal_account",
                            "paypalAccount": {
                                "payerEmail": "payer@example.com"
                            }
                        },
                        success: true,
                        created_at: d,
                        updated_at: d,
                        cart_id: global.cartSeedUuids[1]
                    })
            )

            return Promise.all(promises);
        }
    );
};