const Promise = require('bluebird');
const faker = require('faker');
const CoreService = require('../../server/plugins/core/core.service');


exports.seed = (knex) => {
    return knex(CoreService.DB_TABLES.product_artists)
        .del()
        // .then(() => {
        //     return knex.raw(`ALTER SEQUENCE ${CoreService.DB_TABLES.product_artists}_id_seq RESTART WITH 1`);
        // })
        .then(
            () => {
                let promises = [];
                let d = new Date();

                global.productArtistSeedUuids = [];

                for(let i=1; i<6; i++) {
                    let uuid = faker.random.uuid();
                    global.productArtistSeedUuids.push(uuid);

                    promises.push(
                        knex(CoreService.DB_TABLES.product_artists).insert({
                            id: uuid,
                            description_short: 'Product artist ' + i + ' - ' + faker.lorem.sentence(),
                            description_long: 'Product artist ' + i + ' - ' + faker.lorem.paragraph(),
                            icon: 'sample_artist_icon.jpg',
                            city: 'City' + i,
                            prov_state: 'CA',
                            country: 'US',
                            email: 'artist_email_' + i + '@gmail.com',
                            created_at: d,
                            updated_at: d
                        })
                    )
                }

                return Promise.all(promises);
            }
        );
};
