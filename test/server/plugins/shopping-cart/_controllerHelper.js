'use strict';

const Hoek = require('hoek');
const testHelpers = require('../../testHelpers');
const serverSetup = require('./_serverSetup');
const controller = require('../../../../server/plugins/shopping-cart/shoppingCartController');

let manifest = Hoek.clone(serverSetup.manifest);


async function getServer(manifest) {
    let m = manifest || Hoek.clone(serverSetup.manifest);
    return await testHelpers.getServer(m, serverSetup.composeOptions);
}


async function initController() {
    const server = await getServer();
    controller.setServer(server);

    return {
        controller,
        server
    };
}


function getManifest() {
    return manifest;
}


function getShoppingCartData() {
    let addr = testHelpers.getFakeShippingAddress();

    let cartData = {
        id: new Date().getTime(),
        shipping_city: addr.city,
        shipping_company: addr.company,
        shipping_countryCodeAlpha2: addr.countryCodeAlpha2,
        shipping_email: addr.email,
        shipping_fullName: `${addr.firstName} ${addr.lastName}`,
        shipping_state: addr.state,
        shipping_streetAddress: addr.streetAddress,
        shipping_postalCode: addr.postalCode,

        billing_firstName: addr.firstName,
        billing_lastName: addr.lastName,
        billing_company: addr.company,
        billing_streetAddress: addr.streetAddress,
        billing_city: addr.city,
        billing_postalCode: addr.postalCode,
        billing_state: addr.state,
        billing_countryCodeAlpha2: addr.countryCodeAlpha2,

        shipping_rate: {
            amount: 100.00,
            currency: 'USD',
            servicelevel: {
                name: 'test-service-level'
            }
        },

        cart_items: [
            {
                qty: 1,
                product: {
                    id: 1,
                    title: 'test_title',
                    weight_oz: 10
                },
                total_item_price: 5.00
            }
        ],

        sub_total: 10.00,
        sales_tax: 1.00,
        grand_total: 11.00
    };

    return cartData;s
}


module.exports = {
    getServer,
    initController,
    getManifest,
    getShoppingCartData
}
