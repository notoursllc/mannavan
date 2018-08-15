const { expect } = require('code');
const Lab = require('lab');
const { after, before, describe, it } = exports.lab = Lab.script();
const ShoppingCartMock = require('../../shopping-cart/ShoppingCartMock');
const customs_declarations = require('../../../../../server/plugins/shipping/shippoAPI/customs_declarations.js');
const customs_items = require('../../../../../server/plugins/shipping/shippoAPI/customs_items.js');


const { getController } = require('./_shippingControllerHelper');
const shippingController = getController();


describe('ShippoAPI: createCustomsDeclaration', () => {

    // TODO
    it('should create a new customs declaration object', async() => {
        // let res = null;
        // let error = null;

        // try {
        //     res = await shippingController.listCarrierAccounts();
        // }
        // catch(err) {
        //     error = err;
        //     console.log(err);
        // }

        // expect( res ).to.be.an.object();
        // expect( res.results ).to.be.an.array();
        // expect( error ).not.to.be.an.object();
    });

});


describe('ShippoAPI: listCustomsDeclarations', () => {

    it('should return list of customs declarations', async() => {
        let res = null;
        let error = null;

        try {
            res = await customs_declarations.listCustomsDeclarations();
        }
        catch(err) {
            error = err;
            console.log(err);
        }

        expect( res ).to.be.an.array();
        expect( error ).not.to.be.an.object();
    });

});


describe('ShippoAPI: getCustomsDeclaration', () => {

    //TODO: need to create one first

    // it('should return an object if a valid id is passed', async() => {
    //     let res = null;
    //     let error = null;

    //     let arr = await customs_declarations.listCustomsDeclarations();

    //     try {
    //         res = await customs_declarations.getCustomsDeclaration(arr[0].object_id);
    //     }
    //     catch(err) {
    //         error = err;
    //     }

    //     expect( res ).to.be.an.object();
    //     expect( error ).not.to.be.an.object();
    // });

    it('should return an error if an invalid id is passed', async() => {
        let res = null;
        let error = null;

        try {
            res = await customs_declarations.getCustomsDeclaration('123');
        }
        catch(err) {
            error = err;
        }

        expect( res ).not.to.be.an.object();
        expect( error ).to.be.an.object();
    });

});


describe('ShippoAPI: createCustomsItem()', () => {

    function getRequestData() {
        return {
            description: 'Clothing',
            quantity: 2,
            net_weight: '10.6',
            mass_unit: 'oz',
            value_amount: 2 * 10, // total guess here: $10 * number of items?
            value_currency: 'USD',
            origin_country: 'US',
            metadata: `Cart ID: test`
        }
    }

    function getShoppingCartMock() {
        const ShoppingCart = new ShoppingCartMock({
            id: 123,
            cart_items: [ {}, {} ],
            product_weight_total: '10.6',
            shipping_countryCodeAlpha2: 'AU'
        });

        return ShoppingCart;
    }


    it('should create a Customs Item', async () => {
        let data = getRequestData();
        let customsItem = null;
        let error = null;

        try {
            customsItem = await customs_items.createCustomsItem(data)
        }
        catch(err) {
            error = err;
            console.log(err);
        }

        expect( customsItem ).to.be.an.object();
        expect( error ).not.to.be.an.object();
    });

    it('should create a Customs Item from a ShoppingCart object if shipping address is international', async () => {
        let customsItem = null;
        let error = null;

        try {
            customsItem = await shippingController.createCustomsItemFromShoppingCart(
                getShoppingCartMock()
            )
        }
        catch(err) {
            error = err;
            console.log(err);
        }

        // console.log("CUSTOMS ITEM", customsItem)

        expect( customsItem ).to.be.an.object();
        expect( error ).not.to.be.an.object();
    });


    it('should NOT create a Customs Item from a ShoppingCart object if shipping address is US', async () => {
        let customsItem = null;
        let error = null;

        const ShoppingCart = getShoppingCartMock();
        ShoppingCart.set('shipping_countryCodeAlpha2', 'US');

        try {
            customsItem = await shippingController.createCustomsItemFromShoppingCart(ShoppingCart)
        }
        catch(err) {
            error = err;
            console.log(err);
        }

        // console.log("CUSTOMS ITEM", customsItem)

        expect( customsItem ).to.equal(undefined);
        expect( error ).not.to.be.an.object();
    });


    // it('TEST SHOPPING CART', async () => {
    //     const ShoppingCart = new ShoppingCartMock({
    //         id: 123,
    //         cart_items: [ {}, {} ],
    //         product_weight_total: '10.6',
    //         shipping_countryCodeAlpha2: 'US'
    //     });

    //     console.log("CART MOCK", ShoppingCart)

    //     expect( ShoppingCart.get('id') ).to.equal(123);
    //     expect( ShoppingCart.get('cart_items').length ).to.equal(2);
    //     expect( ShoppingCart.get('product_weight_total') ).to.equal('10.6');
    //     expect( ShoppingCart.get('shipping_countryCodeAlpha2') ).to.equal('US');
    // });

});
