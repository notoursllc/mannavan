'use strict';

const Promise = require('bluebird');
const faker = require('faker');
const CoreService = require('../../server/plugins/core/core.service');


exports.seed = (knex) => {
    return knex(CoreService.DB_TABLES.carts)
        .del()
        // .then(() => {
        //     return knex.raw(`ALTER SEQUENCE ${CoreService.DB_TABLES.product_pics}_id_seq RESTART WITH 1`);
        // })
        .then(() => {
            let promises = [];
            let d = new Date();

            global.cartSeedUuids = [];

            for(let i=1; i<3; i++) {
                let uuid = faker.random.uuid();
                global.cartSeedUuids.push(uuid);

                // For now just need to set the id
                // so the payment seeds can have valid foreign keys
                promises.push(
                    knex(CoreService.DB_TABLES.carts)
                        .insert({
                            id: uuid,
                            created_at: d,
                            updated_at: d
                        })
                )
            }

            return Promise.all(promises);
        }
    );
};