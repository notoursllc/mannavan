const Promise = require('bluebird');
const faker = require('faker');
const CoreService = require('../../server/plugins/core/core.service');
const ProductService = require('../../server/plugins/products/services/ProductService.js');

const productService = new ProductService();
const productTypes = productService.getProductTypes();
const productSubTypes = productService.getProductSubTypes();
const fakeGenderOptions = buildSampleGenderOptions();


function buildSampleGenderOptions() {
    let types = productService.getGenderTypes();
    let opts = [];

    // adding one option for each gender
    Object.keys(types).forEach((key) => {
        opts.push(types[key]);
    });

    // adding a few multi-gender options
    opts.push(types.GENDER_TYPE_MENS | types.GENDER_TYPE_WOMENS);  // mens and womens
    opts.push(types.GENDER_TYPE_MENS | types.GENDER_TYPE_BOYS);  // mens and boys
    opts.push(types.GENDER_TYPE_WOMENS | types.GENDER_TYPE_GIRLS);  // womens and girls
    opts.push(types.GENDER_TYPE_BOYS | types.GENDER_TYPE_GIRLS);  // boys and girls

    return opts;
}


function getRandomGenderOption() {
    return fakeGenderOptions[Math.floor(Math.random() * fakeGenderOptions.length)];
}



exports.seed = (knex) => {
    return knex(CoreService.DB_TABLES.products)
        .del()
        // .then(() => {
        //     return knex.raw(`ALTER SEQUENCE ${CoreService.DB_TABLES.products}_id_seq RESTART WITH 1`);
        // })
        .then(() => {
            let promises = [];
            let d = new Date();
            let cents;
            let artistIndex = 0;

            global.productSeedUuids = [];

            for(let i=1; i<31; i++) {
                if(artistIndex === 5) {
                    artistIndex = 0
                }

                cents = (i < 10) ? parseFloat('0.0' + i) : parseFloat('0.' + i);

                let uuid = faker.random.uuid();
                global.productSeedUuids.push(uuid);

                promises.push(
                    knex(CoreService.DB_TABLES.products)
                        .insert({
                            id: uuid,
                            title: 'Product Title ' + i,
                            description_short: 'Short description ' + i + ' - ' + faker.lorem.sentence(),
                            description_long: 'Long description ' + i + ' - ' + faker.lorem.paragraph(),
                            sku: (10000 + i),
                            seo_uri: 'seo_uri_' + i,
                            cost: ((100 + i + cents).toFixed(2)),
                            weight_oz: 5.3,
                            base_price: ((100 + i + cents).toFixed(2)),
                            sale_price: ((99 - i + cents).toFixed(2)),
                            is_on_sale: faker.random.boolean(),
                            is_available: faker.random.boolean(),
                            tax_code: 20010,
                            video_url: 'https://www.youtube.com/watch?v=JUaY0AOLopU',
                            gender: getRandomGenderOption(),
                            type: productTypes.PRODUCT_TYPE_APPAREL,
                            sub_type: i % 2 ? productSubTypes.PRODUCT_SUBTYPE_TOP : productSubTypes.PRODUCT_SUBTYPE_HAT,
                            inventory_count: (100 + i),
                            hide_if_out_of_stock: true,
                            created_at: d,
                            updated_at: d,
                            product_artist_id: global.productArtistSeedUuids[artistIndex]
                        })
                )
            }

            return Promise.all(promises);
        });
};
