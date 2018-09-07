const Lab = require('lab');
const Code = require('code');
const Hoek = require('hoek');
const forEach = require('lodash.foreach');
const isObject = require('lodash.isobject');
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

        let billingData = testHelpers.getFakeBillingAddress();
        let checkoutPayload = {};
        forEach(billingData, (val, key) => {
            checkoutPayload[`billing_${key}`] = val;
        });

        const { statusCode } = await server.inject({
            method: 'POST',
            url: '/cart/checkout',
            payload: {
                nonce: null,
                ...checkoutPayload
            }
        });

        expect(statusCode, 'Status code').to.equal(400);
    });


    it('should return 400 (Bad Request) when invalid billing data is sent', async () => {
        const { server } = await initController();

        let billingData = testHelpers.getFakeBillingAddress();
        let checkoutPayload = {};
        forEach(billingData, (val, key) => {
            checkoutPayload[`billing_${key}`] = val;
        });

        const goodRequest = {
            method: 'POST',
            url: '/cart/checkout',
            payload: {
                nonce: 'fake-valid-nonce',
                ...checkoutPayload
            }
        };

        let request = null;

        // invalid firstName
        request = Hoek.clone(goodRequest);
        request.payload.billing_firstName = 123;
        await injectAndExpectStatusCode(server, request, 400);

        // invalid lastName
        request = Hoek.clone(goodRequest);
        request.payload.billing_lastName = 123;
        await injectAndExpectStatusCode(server, request, 400);

        // invalid company
        request = Hoek.clone(goodRequest);
        request.payload.billing_company = 123;
        await injectAndExpectStatusCode(server, request, 400);

        // invalid streetAddress
        request = Hoek.clone(goodRequest);
        request.payload.billing_streetAddress = 123;
        await injectAndExpectStatusCode(server, request, 400);

        // invalid extendedAddress
        request = Hoek.clone(goodRequest);
        request.payload.billing_extendedAddress = 123;
        await injectAndExpectStatusCode(server, request, 400);

        // invalid city
        request = Hoek.clone(goodRequest);
        request.payload.billing_city = 123;
        await injectAndExpectStatusCode(server, request, 400);

        // invalid state
        request = Hoek.clone(goodRequest);
        request.payload.billing_state = 123;
        await injectAndExpectStatusCode(server, request, 400);

        // invalid postalCode
        request = Hoek.clone(goodRequest);
        request.payload.billing_postalCode= 123;
        await injectAndExpectStatusCode(server, request, 400);

        // invalid countryCodeAlpha2
        request = Hoek.clone(goodRequest);
        request.payload.billing_countryCodeAlpha2 = 123;
        await injectAndExpectStatusCode(server, request, 400);

        // invalid phone
        request = Hoek.clone(goodRequest);
        request.payload.billing_phone = 123;
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
            expect(checkoutResponse).to.be.an.object();
            expect(checkoutResponse.statusCode, 'Status code').to.equal(200);

            let paymentID;
            if(isObject(checkoutResponse.result.data)) {
                paymentID = checkoutResponse.result.data.transactionId || null;
            }

            expect(paymentID, 'Payment ID').to.be.a.string();

            // verify that the DB contains data about the transaction:
            // wait a few seconds for the other DB transactions to happen
            setTimeout(async () => {
                // Payment:
                const Payment = await controller.getPaymentByAttribute('id', paymentID);
                const p = Payment.toJSON();

                expect(p.id, 'Payment ID').to.equal(paymentID);

                // ShoppingCartToShippoOrder:
                const ShippoOrder = await controller.getShippoOrder(p.shoppingCart.id)
                const order = ShippoOrder.toJSON();

                expect(order.cart_id, 'ShoppingCartToShippoOrder Cart ID').to.equal(p.shoppingCart.id);

                // Purchase confirmation emails:
                let ShoppingCart = await controller.getCart( testHelpers.getCartToken() )
                expect(ShoppingCart.get('purchase_confirmation_email_sent_at'), 'Purchase confirmation email sent at').to.be.a.date();

                resolve();
            }, 3000)
        })
    });

});
