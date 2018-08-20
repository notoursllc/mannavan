const Lab = require('lab');
const Code = require('code');
const Hoek = require('hoek');
const faker = require('faker');
const testHelpers = require('../../../testHelpers');
const shoppingCartMock = require('../ShoppingCartMock');
const shoppingCartController = require('../../../../../server/plugins/shopping-cart/shoppingCartController');
const { initController } = require('../_controllerHelper');

const lab = exports.lab = Lab.script();
const describe = lab.experiment;
const expect = Code.expect;
const it = lab.test;


async function injectAndExpectStatusCode(server, request, expectedStatusCode) {
    const { statusCode } = await server.inject(request);
    expect(statusCode, 'Status code').to.equal(expectedStatusCode);
}


describe('Testing route: POST /cart/checkout', () => {
    it('should return 400 (Bad Request) when nonce is not sent in the payload', async (done) => {
        const { server } = await initController();

        const { statusCode } = await server.inject({
            method: 'POST',
            url: '/cart/checkout',
            payload: {
                nonce: null,
                billing: testHelpers.getFakeBillingAddress(),
                shipping: testHelpers.getFakeShippingAddress()
            }
        });

        expect(statusCode, 'Status code').to.equal(400);
    });


    it('should return 400 (Bad Request) when invalid shipping data is sent', async () => {
        const { server } = await initController();

        const goodRequest = {
            method: 'POST',
            url: '/cart/checkout',
            payload: {
                nonce: 'fake-valid-nonce',
                billing: testHelpers.getFakeBillingAddress(),
                shipping: testHelpers.getFakeShippingAddress()
            }
        };

        let request = null;

        // missing shipping data
        request = Hoek.clone(goodRequest);
        request.payload.shipping = null;
        await injectAndExpectStatusCode(server, request, 400);

        // invalid firstName
        request = Hoek.clone(goodRequest);
        request.payload.shipping.firstName = 123;
        await injectAndExpectStatusCode(server, request, 400);

        // invalid lastName
        request = Hoek.clone(goodRequest);
        request.payload.shipping.lastName = 123;
        await injectAndExpectStatusCode(server, request, 400);

        // invalid company
        request = Hoek.clone(goodRequest);
        request.payload.shipping.company = 123;
        await injectAndExpectStatusCode(server, request, 400);

        // invalid streetAddress
        request = Hoek.clone(goodRequest);
        request.payload.shipping.streetAddress = 123;
        await injectAndExpectStatusCode(server, request, 400);

        // invalid extendedAddress
        request = Hoek.clone(goodRequest);
        request.payload.shipping.extendedAddress = 123;
        await injectAndExpectStatusCode(server, request, 400);

        // invalid city
        request = Hoek.clone(goodRequest);
        request.payload.shipping.city = 123;
        await injectAndExpectStatusCode(server, request, 400);

        // invalid state
        request = Hoek.clone(goodRequest);
        request.payload.shipping.state = 123;
        await injectAndExpectStatusCode(server, request, 400);

        // invalid postalCode
        request = Hoek.clone(goodRequest);
        request.payload.shipping.postalCode = 123;
        await injectAndExpectStatusCode(server, request, 400);

        // invalid countryCodeAlpha2
        request = Hoek.clone(goodRequest);
        request.payload.shipping.countryCodeAlpha2 = 123;
        await injectAndExpectStatusCode(server, request, 400);

        // invalid email
        request = Hoek.clone(goodRequest);
        request.payload.shipping.email = 123;
        await injectAndExpectStatusCode(server, request, 400);
    });


    it('should return 400 (Bad Request) when invalid billing data is sent', async (done) => {
        const { server } = await initController();

        const goodRequest = {
            method: 'POST',
            url: '/cart/checkout',
            payload: {
                nonce: 'fake-valid-nonce',
                billing: testHelpers.getFakeBillingAddress(),
                shipping: testHelpers.getFakeShippingAddress()
            }
        };

        let request = null;

        request = Hoek.clone(goodRequest);
        request.payload.billing = null;
        await injectAndExpectStatusCode(server, request, 400);

        // invalid firstName
        request = Hoek.clone(goodRequest);
        request.payload.billing.firstName = 123;
        await injectAndExpectStatusCode(server, request, 400);

        // invalid lastName
        request = Hoek.clone(goodRequest);
        request.payload.billing.lastName = 123;
        await injectAndExpectStatusCode(server, request, 400);

        // invalid company
        request = Hoek.clone(goodRequest);
        request.payload.billing.company = 123;
        await injectAndExpectStatusCode(server, request, 400);

        // invalid streetAddress
        request = Hoek.clone(goodRequest);
        request.payload.billing.streetAddress = 123;
        await injectAndExpectStatusCode(server, request, 400);

        // invalid extendedAddress
        request = Hoek.clone(goodRequest);
        request.payload.billing.extendedAddress = 123;
        await injectAndExpectStatusCode(server, request, 400);

        // invalid city
        request = Hoek.clone(goodRequest);
        request.payload.billing.city = 123;
        await injectAndExpectStatusCode(server, request, 400);

        // invalid state
        request = Hoek.clone(goodRequest);
        request.payload.billing.state = 123;
        await injectAndExpectStatusCode(server, request, 400);

        // invalid postalCode
        request = Hoek.clone(goodRequest);
        request.payload.billing.postalCode = 123;
        await injectAndExpectStatusCode(server, request, 400);

        // invalid countryCodeAlpha2
        request = Hoek.clone(goodRequest);
        request.payload.billing.countryCodeAlpha2 = 123;
        await injectAndExpectStatusCode(server, request, 400);

        // invalid phone
        request = Hoek.clone(goodRequest);
        request.payload.billing.phone = 123;
        await injectAndExpectStatusCode(server, request, 400);
    });
});


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
        let ShippoOrder = null;
        let error = null;
        let cartData = getCartData();

        try {
            ShippoOrder = await shoppingCartController.createShippoOrderFromShoppingCart(new shoppingCartMock(cartData))
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
            ShippoOrder = await shoppingCartController.createShippoOrderFromShoppingCart(new shoppingCartMock(cartData))
        }
        catch(err) {
            error = err;
        }

        expect( ShippoOrder ).not.to.be.an.object();
        expect( error ).to.be.an.object();
        expect( error.message ).to.equal( 'Request failed with status code 400' );
    });


    it('should return an error when a ShoppingCart is not passed', async () => {
        let ShippoOrder = null;
        let error = null;

        try {
            ShippoOrder = await shoppingCartController.createShippoOrderFromShoppingCart();
        }
        catch(err) {
            error = err;
        }

        expect( ShippoOrder ).not.to.be.an.object();
        expect( error ).to.be.an.object();
    });
});


describe('Testing controller method: saveShippoOrder', () => {
    it('should return a ShoppingCartToShippoOrderObject upon saving successfully', async (done) => {
        const { controller, server } = await initController();

        const { result } = await server.inject({
            method: 'GET',
            url: '/cart/get'
        });

        // console.log("CART DATA", result.data)
        expect( result.data ).to.be.an.object();

        const ShoppingCartToShippoOrder = await controller.saveShippoOrder(
            result.data.id,
            { "test": "test2" }
        );

        expect( ShoppingCartToShippoOrder ).to.be.an.object();
        // console.log("+++++++++++ ShoppingCartToShippoOrder", ShoppingCartToShippoOrder)

        const jsonObj = ShoppingCartToShippoOrder.get('shippo_order');
        expect( jsonObj.test ).to.equal('test2')
    });


    it('should return an error if the cart ID is not a foreign key of a cart', async (done) => {
        const { controller, server } = await initController();
        let ShoppingCartToShippoOrder = null;
        let error = null;

        try {
            ShoppingCartToShippoOrder = await controller.saveShippoOrder(
                faker.random.uuid(),
                { "test": "test2" }
            );
        }
        catch(err) {
            error = err;
            // console.log("ERROR", err)
        }

        expect( ShoppingCartToShippoOrder ).not.to.be.an.object();
        expect( error ).to.be.an.object();
    });
});
