const faker = require('faker');
const CoreService = require('../../server/plugins/core/core.service');

exports.seed = (knex) => {
    return knex(CoreService.DB_TABLES.package_types)
        .del()
        // .then(() => {
        //     return knex.raw(`ALTER SEQUENCE ${CoreService.DB_TABLES.customers}_id_seq RESTART WITH 1`);
        // })
        .then(() => {
            let d = new Date();
            let promises = [];

            promises.push(
                knex(CoreService.DB_TABLES.package_types).insert({
                    id: faker.random.uuid(),
                    type: 0x01,
                    label: 'Flat Mailer: 8.75 x 12',
                    length: 12.00,
                    width: 8.75,
                    height: 0,
                    weight: 2.0,
                    mass_unit: 'oz',   // https://goshippo.com/docs/reference/js#parcels
                    distance_unit: 'in',  // https://goshippo.com/docs/reference/js#parcels
                    created_at: d,
                    updated_at: d
                }),

                knex(CoreService.DB_TABLES.package_types).insert({
                    id: faker.random.uuid(),
                    type: 0x02,
                    label: 'Flat Mailer: 7 x 9',
                    length: 9.00,
                    width: 7.00,
                    height: 0,
                    weight: 2.0,
                    mass_unit: 'oz',
                    distance_unit: 'in',
                    created_at: d,
                    updated_at: d
                }),

                knex(CoreService.DB_TABLES.package_types).insert({
                    id: faker.random.uuid(),
                    type: 0x04,
                    label: 'Box: 4 x 4 x 4',
                    length: 4.00,
                    width: 4.00,
                    height: 4.00,
                    weight: 4.0,
                    mass_unit: 'oz',
                    distance_unit: 'in',
                    created_at: d,
                    updated_at: d
                }),

                knex(CoreService.DB_TABLES.package_types).insert({
                    id: faker.random.uuid(),
                    type: 0x08,
                    label: 'Box: 6 x 6 x 4',
                    length: 6.00,
                    width: 6.00,
                    height: 4.00,
                    weight: 6.0,
                    mass_unit: 'oz',
                    distance_unit: 'in',
                    created_at: d,
                    updated_at: d
                })
            );

            return Promise.all(promises);
        });
};
