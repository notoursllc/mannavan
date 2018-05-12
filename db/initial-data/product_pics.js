'use strict';

const Promise = require('bluebird');
const faker = require('faker');
const CoreService = require('../../server/plugins/core/core.service');
const ProductPicService = require('../../server/plugins/products/services/ProductPicService');

const productPicService = new ProductPicService();


exports.seed = (knex) => {
    return knex(CoreService.DB_TABLES.product_pics)
        .del()
        // .then(() => {
        //     return knex.raw(`ALTER SEQUENCE ${CoreService.DB_TABLES.product_pics}_id_seq RESTART WITH 1`);
        // })
        .then(() => {
            let promises = [];
            let d = new Date();
            let uuid;
            let urlPrefix = productPicService.getCloudUrl();

            global.productPicSeedUuids = [];
            global.productSeedUuids = global.productSeedUuids || [];

            // Every product gets 2 pictures
            for(var i=0; i<global.productSeedUuids.length; i++) {
                // picture 1
                uuid = faker.random.uuid();
                global.productPicSeedUuids.push(uuid);
                
                promises.push(
                    knex(CoreService.DB_TABLES.product_pics)
                        .insert({
                            id: uuid,
                            url: `${urlPrefix}/${productPicService.getCloudImagePath('sample-300-x-400.png')}`,
                            sort_order: 1,
                            is_visible: true,
                            created_at: d,
                            updated_at: d,
                            product_id: global.productSeedUuids[i]
                        })
                )

                // picture 2
                uuid = faker.random.uuid();
                global.productPicSeedUuids.push(uuid);
                promises.push(
                    knex(CoreService.DB_TABLES.product_pics)
                        .insert({
                            id: uuid,
                            url: `${urlPrefix}/${productPicService.getCloudImagePath('sample_calbeamin.jpg')}`,
                            sort_order: 2,
                            is_visible: true,
                            created_at: d,
                            updated_at: d,
                            product_id: global.productSeedUuids[i]
                        })
                )
            }

            return Promise.all(promises);
        }
    );
};