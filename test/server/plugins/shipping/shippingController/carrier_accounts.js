require('dotenv').config();

const Code = require('code');
const Lab = require('lab');
const { getController, getCarrierAccount } = require('./_shippingControllerHelper');

const lab = exports.lab = Lab.script();
const describe = lab.experiment;
const expect = Code.expect;
const it = lab.test;

const shippingController = getController();


describe('Shippo Controller: listCarrierAccounts', () => {

    it('should return a list of carrier accounts', async() => {
        let res = null;
        let error = null;

        try {
            res = await shippingController.listCarrierAccounts();
        }
        catch(err) {
            error = err;
            console.log(err);
        }

        expect( res ).to.be.an.object();
        expect( res.results ).to.be.an.array();
        expect( error ).not.to.be.an.object();
    });

});


describe('Shippo Controller: getCarrierAccount', () => {

    it('should return a carrier account for the given id', async() => {
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
    });


    it('should return an error if an invalid id is passed', async() => {
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
    });

});
