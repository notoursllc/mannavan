require('dotenv').config();

const { expect } = require('code');
const Lab = require('lab');
const { after, before, describe, it } = exports.lab = Lab.script();

const { getCarrierAccount } = require('../shippingController/_shippingControllerHelper');
const carrier_accounts = require('../../../../../server/plugins/shipping/shippoAPI/carrier_accounts');


describe('ShippoAPI: listCarrierAccounts', () => {

    it('should return a list of carrier accounts', async() => {
        let res = null;
        let error = null;

        try {
            res = await carrier_accounts.listCarrierAccounts();
        }
        catch(err) {
            error = err;
            console.log(err);
        }

        // console.log("CARRIER ACCOUNTS", res)

        expect( res ).to.be.an.array();
        expect( error ).not.to.be.an.object();
    });

});


describe('ShippoAPI: getCarrierAccount', () => {

    it('should return a carrier account for the given id', async() => {
        let res = null;
        let error = null;
        let account = await getCarrierAccount();

        try {
            res = await carrier_accounts.getCarrierAccount(account.object_id);
        }
        catch(err) {
            error = err;
            console.log(err);
        }

        // console.log("GET CARRIER ACCOUNT", res)

        expect( res ).to.be.an.object();
        expect( error ).not.to.be.an.object();
    });


    it('should return an error if an invalid id is passed', async() => {
        let res = null;
        let error = null;

        try {
            res = await carrier_accounts.getCarrierAccount('123');
        }
        catch(err) {
            error = err;
        }

        expect( res ).not.to.be.an.object();
        expect( error ).to.be.an.object();
    });

});
