'use strict';

const Hoek = require('hoek');
const testHelpers = require('../../../testHelpers');
const serverSetup = require('../_serverSetup');
const shippingController = require('../../../../../server/plugins/shipping/shippingController');
const carrier_accounts = require('../../../../../server/plugins/shipping/shippoAPI/carrier_accounts.js');



function getController() {
    return shippingController;
}


async function getServer() {
    return await testHelpers.getServer(
        Hoek.clone(serverSetup.manifest),
        serverSetup.composeOptions
    );
}


async function getCarrierAccount(index) {
    const key = index ? parseInt(index, 10) : 0;
    const results = await carrier_accounts.listCarrierAccounts();
    return results[key];
}


function getShipmentData() {
    return {
        address_from: {
            name: 'Shawn Ippotle',
            street1: '215 Clayton St.',
            city: 'San Francisco',
            state: 'CA',
            zip: '94117',
            country: 'US',
            phone: '+1 555 341 9393',
            email: 'shippotle@goshippo.com'
        },
        address_to: {
            name: 'Mr Hippo',
            street1: 'Broadway 1',
            city: 'New York',
            state: 'NY',
            zip: '10007',
            country: 'US',
            phone: '+1 555 341 9393',
            email: 'mrhippo@goshippo.com'
        },
        parcels: [{
            length: '5',
            width: '5',
            height: '5',
            distance_unit: 'in',
            weight: '2',
            mass_unit: 'lb'
        }],
        shipment_date: '2013-12-03T12:00:00.000Z',
        // address_return: null,
        // customs_declaration: null,
        // extra: null,
        // metadata: null,
        async: true
    }
}


module.exports = {
    getServer,
    getController,
    getCarrierAccount,
    getShipmentData
}
