require('dotenv').config();

const Code = require('code');
const Lab = require('lab');
const { getController, getShipmentData } = require('./_shippingControllerHelper');

const lab = exports.lab = Lab.script();
const describe = lab.experiment;
const expect = Code.expect;
const it = lab.test;

const shippingController = getController();

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


describe('Shippo Controller: createShippingLabelFromShipment', () => {

    it('errors on missing "carrier_account" value when creating a shipping label', async() => {
        let data = getCreateShippingLabelRequestData();
        delete data.carrier_account;

        let shipment = null;
        let error = null;

        try {
            shipment = await shippingController.createShippingLabelFromShipment(data)
        }
        catch(err) {
            error = err;
        }

        expect( shipment ).not.to.be.an.object();
        expect( error ).to.be.an.object();
        expect( error.message ).to.include('"carrier_account" is required');
    });


    it('errors on missing "servicelevel_token" value when creating a shipping label', async() => {
        let data = getCreateShippingLabelRequestData();
        delete data.servicelevel_token;

        let shipment = null;
        let error = null;

        try {
            shipment = await shippingController.createShippingLabelFromShipment(data)
        }
        catch(err) {
            error = err;
        }

        expect( shipment ).not.to.be.an.object();
        expect( error ).to.be.an.object();
        expect( error.message ).to.include('"servicelevel_token" is required');
    });


    it('errors if "label_file_type" is an incorrect value', async() => {
        let data = getCreateShippingLabelRequestData();
        data.label_file_type = "FOO";

        let shipment = null;
        let error = null;

        try {
            shipment = await shippingController.createShippingLabelFromShipment(data)
        }
        catch(err) {
            error = err;
        }

        expect( shipment ).not.to.be.an.object();
        expect( error ).to.be.an.object();
        expect( error.message ).to.include('"label_file_type" must be one of');
    });

/*
    it('returns a shipment object when creating a shipping label', async() => {
        let data = getCreateShippingLabelRequestData();
        let shipment = null;
        let error = null;

        try {
            shipment = await shippingController.createShippingLabelFromShipment(data)
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
