let api_clients = require('../initial-data/api_clients');
let customers = require('../initial-data/customers');
let product_artists = require('../initial-data/product_artists');
let product_pics = require('../initial-data/product_pics');
let product_sizes = require('../initial-data/product_sizes');
let products = require('../initial-data/products');
let payments = require('../initial-data/payments');
let carts = require('../initial-data/carts');

/**
 * Knex.js's seed functionality does not provide any order of execution guarantees,
 * so this function will run the seeds in the order that we want
 * 
 * @param knex
 * @param Promise
 * @returns {*}
 */
exports.seed = (knex, Promise) => {
    
    return customers.seed(knex, Promise)
        // Product Artists
        .then(() => {
            return product_artists.seed(knex, Promise);
        })
            
        // Products
        .then(() => {
            return products.seed(knex, Promise);
        })

        // Carts
        .then(() => {
            return carts.seed(knex, Promise);
        })

        // ...the rest, which do not depend on any specific order
        .then(() => {
            return Promise.all([
                api_clients.seed(knex, Promise),
                product_pics.seed(knex, Promise),
                product_sizes.seed(knex, Promise),
                payments.seed(knex, Promise)
            ])
        });
};