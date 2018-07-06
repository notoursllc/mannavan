require('dotenv').config();

const { expect } = require('code');
const Lab = require('lab');
const { after, before, describe, it } = exports.lab = Lab.script();

const { getServer, getController, getCarrierAccount } = require('./_shippingControllerHelper');
const shippingController = getController();


describe('Shipping Controller: listCarrierAccounts', () => {

    it('should return a list of carrier accounts', async() => {
        const server = await getServer();
        shippingController.setServer(server);

        let res = null;
        let error = null;

        try {
            res = await shippingController.listCarrierAccounts();
        }
        catch(err) {
            error = err;
            console.log(err);
        }

        // console.log("CARRIER ACCOUNTS", res)

        expect( res ).to.be.an.object();
        expect( res.results ).to.be.an.array();
        expect( error ).not.to.be.an.object();

        server.stop();
    });

});


describe('Shippo Controller: getCarrierAccount', () => {

    it('should return a carrier account for the given id', async() => {
        const server = await getServer();
        shippingController.setServer(server);

        let res = null;
        let error = null;
        let account = await getCarrierAccount();

        try {
            res = await shippingController.getCarrierAccount(account.object_id);
        }
        catch(err) {
            error = err;
            console.log(err);
        }

        expect( res ).to.be.an.object();
        expect( error ).not.to.be.an.object();

        server.stop();
    });


    it('should return an error if an invalid id is passed', async() => {
        const server = await getServer();
        shippingController.setServer(server);

        let res = null;
        let error = null;
        let account = await getCarrierAccount();

        try {
            res = await shippingController.getCarrierAccount('123');
        }
        catch(err) {
            error = err;
        }

        expect( res ).not.to.be.an.object();
        expect( error ).to.be.an.object();

        server.stop();
    });

});
