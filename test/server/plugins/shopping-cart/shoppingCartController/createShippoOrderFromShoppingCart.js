'use strict';

const { expect } = require('code');
const Lab = require('lab');
const { after, before, describe, it } = exports.lab = Lab.script();

const shoppingCartMock = require('../ShoppingCartMock');
const testHelpers = require('../../../testHelpers');
const { initController } = require('../_controllerHelper');


describe('Testing controller method: createShippoOrderFromShoppingCart', () => {

    function getCartData() {
        let addr = testHelpers.getFakeShippingAddress();

        return {
            id: new Date().getTime(),
            shipping_city: addr.city,
            shipping_company: addr.company,
            shipping_countryCodeAlpha2: addr.countryCodeAlpha2,
            shipping_email: addr.email,
            shipping_fullName: `${addr.firstName} ${addr.lastName}`,
            shipping_state: addr.state,
            shipping_streetAddress: addr.streetAddress,
            shipping_postalCode: addr.postalCode,

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
        }
    }


    it('should return a Shippo Order object', async () => {
        const { controller } = await initController();
        let ShippoOrder = null;
        let error = null;
        let cartData = getCartData();

        try {
            ShippoOrder = await controller.createShippoOrderFromShoppingCart(new shoppingCartMock(cartData))
        }
        catch(err) {
            error = err;
        }

        // console.log("SHIPPO ORDER", ShippoOrder)

        expect( ShippoOrder ).to.be.an.object();
        expect( error ).not.to.be.an.object();

        // just a few data checks.  Not comprehensive:
        expect ( ShippoOrder.order_number ).to.equal( cartData.id + '' );
        expect ( ShippoOrder.order_status ).to.equal( 'PAID' );
        expect ( ShippoOrder.to_address.name ).to.equal( cartData.shipping_fullName );
    });


    it('should return an error when a ShoppingCart does not contain shipping address data', async () => {
        const { controller } = await initController();
        let ShippoOrder = null;
        let error = null;
        let cartData = getCartData();

        delete cartData.shipping_city;
        delete cartData.shipping_company;
        delete cartData.shipping_countryCodeAlpha2;
        delete cartData.shipping_email;
        delete cartData.shipping_fullName;
        delete cartData.shipping_state;
        delete cartData.shipping_streetAddress;
        delete cartData.shipping_postalCode;

        try {
            ShippoOrder = await controller.createShippoOrderFromShoppingCart(new shoppingCartMock(cartData))
        }
        catch(err) {
            error = err;
        }

        expect( ShippoOrder ).not.to.be.an.object();
        expect( error ).to.be.an.object();
        expect( error.message ).to.equal( 'Request failed with status code 400' );
    });


    it('should return an error when a ShoppingCart is not passed', async () => {
        const { controller } = await initController();
        let ShippoOrder = null;
        let error = null;

        try {
            ShippoOrder = await controller.createShippoOrderFromShoppingCart();
        }
        catch(err) {
            error = err;
        }

        expect( ShippoOrder ).not.to.be.an.object();
        expect( error ).to.be.an.object();
    });

});
