const Lab = require('lab');
const Code = require('code');
const Hoek = require('hoek');
const forEach = require('lodash.foreach');
const testHelpers = require('../../../testHelpers');
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

    it('should return 400 (Bad Request) when nonce is not sent in the payload', async () => {
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


    it('should return 400 (Bad Request) when invalid billing data is sent', async () => {
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


    it('should have all the right data in the DB after a successful checkout', { timeout: 10000 }, async () => {
        return new Promise(async (resolve) => {
            const { server, controller } = await initController();

            // Get a random product
            // Add product to the cart
            let productId = await testHelpers.getProduct(server);
            let addResposne = await testHelpers.addToCart(server, productId);
            expect(addResposne.statusCode, 'Status code').to.equal(200);

            // Set shipping data
            let shippingData = testHelpers.getFakeShippingAddress();
            let shippingPayload = {};
            forEach(shippingData, (val, key) => {
                shippingPayload[`shipping_${key}`] = val;
            });

            let shippingResponse = await server.inject({
                method: 'POST',
                url: '/cart/shipping/address',
                headers: testHelpers.getRequestHeader(),
                payload: shippingPayload
            });
            expect(shippingResponse.statusCode, 'Status code').to.equal(200);


            let billingData = testHelpers.getFakeBillingAddress();
            let checkoutPayload = {};
            forEach(billingData, (val, key) => {
                checkoutPayload[`billing_${key}`] = val;
            });

            let checkoutResponse = await server.inject({
                method: 'POST',
                url: '/cart/checkout',
                headers: testHelpers.getRequestHeader(),
                payload: {
                    nonce: 'fake-valid-nonce',
                    ...checkoutPayload
                }
            });

            let transactionID = checkoutResponse.result.data.transactionId;

            expect(checkoutResponse.statusCode, 'Status code').to.equal(200);
            expect(transactionID, 'Transaction ID').to.exist();

            // verify that the DB contains data about the transaction:
            // wait a few seconds for the other DB transactions to happen
            setTimeout(async () => {
                // Payment:
                const Payment = await controller.getPaymentByAttribute('transaction_id', transactionID);
                const p = Payment.toJSON();
                // console.log("PAYMENT", p)
                expect(p.transaction_id, 'Payment Transaction ID').to.equal(transactionID);

                // ShoppingCartToShippoOrder:
                const ShippoOrder = await controller.getShippoOrder(p.shoppingCart.id)
                const order = ShippoOrder.toJSON();
                // console.log("SHIPPO ORDR", order)
                expect(order.cart_id, 'ShoppingCartToShippoOrder Cart ID').to.equal(p.shoppingCart.id);

                resolve();
            }, 3000)
        })
    });

});
