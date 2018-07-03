const { expect } = require('code');
const Lab = require('lab');
const { after, before, describe, it } = exports.lab = Lab.script();
const ShoppingCartMock = require('../../shopping-cart/ShoppingCartMock');

const { getController, getCarrierAccount } = require('./_shippingControllerHelper');
const shippingController = getController();


describe('Shippo Controller: createCustomsDeclaration', () => {

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


describe('Shippo Controller: listCustomsDeclarations', () => {

    it('should return list of customs declarations', async() => {
        let res = null;
        let error = null;
        let account = await getCarrierAccount();

        try {
            res = await shippingController.listCustomsDeclarations();
        }
        catch(err) {
            error = err;
            console.log(err);
        }

        expect( res ).to.be.an.object();
        expect( error ).not.to.be.an.object();
    });

});


describe('Shippo Controller: getCustomsDeclaration', () => {

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


    it('should return an error if an invalid id is passed', async() => {
        let res = null;
        let error = null;
        let account = await getCarrierAccount();

        try {
            res = await shippingController.getCustomsDeclaration('123');
        }
        catch(err) {
            error = err;
        }

        expect( res ).not.to.be.an.object();
        expect( error ).to.be.an.object();
    });

});


describe('Shippo Controller: createCustomsItem()', () => {

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
            customsItem = await shippingController.createCustomsItem(data)
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
