const Promise = require('bluebird');
const faker = require('faker');
const CoreService = require('../../server/plugins/core/core.service');
const globalTypes = require('../../client_server_shared/global_types.js')
const fakeFitOptions = buildSampleFitOptions();


function buildSampleFitOptions() {
    let opts = [];

    // adding one option for each fit
    Object.keys(globalTypes.product.fits).forEach((key) => {
        opts.push(globalTypes.product.fits[key]);
    });

    // adding a few multi-fit options
    opts.push(globalTypes.product.fits.FIT_TYPE_MENS | globalTypes.product.fits.FIT_TYPE_BOYS);  // mens and boys
    opts.push(globalTypes.product.fits.FIT_TYPE_WOMENS | globalTypes.product.fits.FIT_TYPE_GIRLS);  // womens and girls

    return opts;
}


function getRandomFitOption() {
    return fakeFitOptions[Math.floor(Math.random() * fakeFitOptions.length)];
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

                let subType = i % 2 ? globalTypes.product.subtypes.PRODUCT_SUBTYPE_TOP : globalTypes.product.subtypes.PRODUCT_SUBTYPE_HAT;
                let materialType = i % 2 ? globalTypes.product.material_types.MATERIAL_TYPE_COTTON : globalTypes.product.material_types.MATERIAL_TYPE_TRI_BLEND;
                let shippingPackageType = (subType === globalTypes.product.subtypes.PRODUCT_SUBTYPE_TOP ? 0x01 : 0x04);

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
                            fit: getRandomFitOption(),
                            type: globalTypes.product.types.PRODUCT_TYPE_APPAREL,
                            sub_type: subType,
                            material_type: materialType,
                            shipping_package_type: shippingPackageType,
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
