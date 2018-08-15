require('dotenv').config();

const { expect } = require('code');
const Lab = require('lab');
const { after, before, describe, it } = exports.lab = Lab.script();

const { getShipmentData } = require('./_shippingControllerHelper');
const { createShippingLabelFromShipment } = require('../../../../../server/plugins/shipping/shippoAPI/transactions.js')


function getCreateShippingLabelRequestData() {
    let data = {
        shipment: getShipmentData()
    };
    data.servicelevel_token = 'usps_priority';
    data.carrier_account = 'b741b99f95e841639b54272834bc478c';
    // data.order = '123';
    data.metadata = 'foo';
    data.label_file_type = 'PNG';
    return data;
}


describe('ShippoAPI: createShippingLabelFromShipment', () => {

    it('errors on missing "carrier_account" value when creating a shipping label', async() => {
        let data = getCreateShippingLabelRequestData();
        delete data.carrier_account;

        let res = null;
        let error = null;

        try {
            res = await createShippingLabelFromShipment(data)
        }
        catch(err) {
            error = err;
        }

        expect( res ).not.to.be.an.object();
        expect( error ).to.be.an.object();
        expect( error.message ).to.include('Request failed with status code 400');
    });


    it('errors on missing "servicelevel_token" value when creating a shipping label', async() => {
        let data = getCreateShippingLabelRequestData();
        delete data.servicelevel_token;

        let res = null;
        let error = null;

        try {
            res = await createShippingLabelFromShipment(data)
        }
        catch(err) {
            error = err;
        }

        expect( res ).not.to.be.an.object();
        expect( error ).to.be.an.object();
        // expect( error.message ).to.include('Request failed with status code 400');
    });


    it('errors if "label_file_type" is an incorrect value', async() => {
        let data = getCreateShippingLabelRequestData();
        data.label_file_type = "FOO";

        let res = null;
        let error = null;

        try {
            res = await createShippingLabelFromShipment(data)
        }
        catch(err) {
            error = err;
        }

        expect( res ).not.to.be.an.object();
        expect( error ).to.be.an.object();
        expect( error.message ).to.include('Request failed with status code 400');
    });

/*
    it('returns a shipment object when creating a shipping label', async() => {
        let data = getCreateShippingLabelRequestData();
        let shipment = null;
        let error = null;

        try {
            shipment = await createShippingLabelFromShipment(data)
            // shippingController.createShipment(
            //     getShipmentData()
            // ).then((result) => {
            //     console.log("RES", result)
            //     expect( result ).to.be.an.object();
            // })
        }
        catch(err) {
            error = err;
            console.log("ERR", err)
        }

        console.log("SHIPMENT", shipment)

        expect( shipment ).to.be.an.object();
        // expect( error ).not.to.be.an.object();
    });
    */
});
