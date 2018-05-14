const Lab = require('lab');
const Code = require('code');
const Hoek = require('hoek');
const testHelpers = require('../../../testHelpers');
const serverSetup = require('../_serverSetup');

const lab = exports.lab = Lab.script();
const describe = lab.experiment;
const expect = Code.expect;
const it = lab.test;


function injectAndExpectStatusCode(server, request, statusCode) {
    server.inject(request, (res) => {
        expect(res.statusCode, 'Status code').to.equal(statusCode);
    });
}


describe('Testing route: POST /cart/checkout', () => {
    // it('should return 200 when checking out', (done) => {
    //     let manifest = Hoek.clone(serverSetup.manifest);
    //     manifest.registrations[0].plugin.options.customSessionIDGenerator = function(request) {
    //         return 'abcde';
    //     };
    //
    //     Server.init(manifest, serverSetup.composeOptions, (err, server) => {
    //         expect(err).to.not.exist();
    //
    //         testHelpers.getInfo(server, ({crumb}) => {
    //             // Add a new item to the cart
    //             // Get the 'itemId' of that new item from the response
    //             // Delete the item from the cart
    //             const request = {
    //                 method: 'POST',
    //                 url: '/cart/checkout',
    //                 payload: {
    //                     nonce: 'fake-valid-nonce', // https://developers.braintreepayments.com/reference/general/testing/node
    //                     billing: testHelpers.getFakeBillingAddress(),
    //                     shipping: testHelpers.getFakeShippingAddress()
    //                 },
    //                 headers: {
    //                     'x-csrf-token': crumb,
    //                     cookie: 'crumb=' + crumb
    //                 }
    //             };
    //
    //             server.inject(request, (res) => {
    //                 expect(res.statusCode, 'Status code').to.equal(200);
    //                 // console.log("CHECKOUT RESPONSE", res.result.data);
    //                 testHelpers.destroyKnexAndStopServer(server, done);
    //             });
    //         });
    //     });
    // });

    it('should return 400 (Bad Request) when nonce is not sent in the payload', (done) => {
        let manifest = Hoek.clone(serverSetup.manifest);
        // manifest.registrations[0].plugin.options.customSessionIDGenerator = function(request) {
        //     return '12345';
        // };

        testHelpers
            .startServerAndGetHeaders(manifest, serverSetup.composeOptions)
            .then(({err, server, headers}) => {
                expect(err).not.to.exist();

                // Add a new item to the cart
                // Get the 'itemId' of that new item from the response
                // Delete the item from the cart
                const request = {
                    method: 'POST',
                    url: '/cart/checkout',
                    headers,
                    payload: {
                        nonce: null,
                        billing: testHelpers.getFakeBillingAddress(),
                        shipping: testHelpers.getFakeShippingAddress()
                    }
                };

                server.inject(request, (res) => {
                    expect(res.statusCode, 'Status code').to.equal(400);
                    testHelpers.destroyKnexAndStopServer(server, done);
                });
            });
    });


    it('should return 400 (Bad Request) when invalid shipping data is sent', (done) => {
        let manifest = Hoek.clone(serverSetup.manifest);
        // manifest.registrations[0].plugin.options.customSessionIDGenerator = function(request) {
        //     return '12345';
        // };

        testHelpers
            .startServerAndGetHeaders(manifest, serverSetup.composeOptions)
            .then(({err, server, headers}) => {
                expect(err).not.to.exist();

                const goodRequest = {
                    method: 'POST',
                    url: '/cart/checkout',
                    headers,
                    payload: {
                        nonce: 'fake-valid-nonce',
                        billing: testHelpers.getFakeBillingAddress(),
                        shipping: testHelpers.getFakeShippingAddress()
                    }
                };

                (function() {
                    let request = Hoek.clone(goodRequest);
                    request.payload.shipping = null;
                    injectAndExpectStatusCode(server, request, 400);
                }());

                // invalid firstName
                (function() {
                    let request = Hoek.clone(goodRequest);
                    request.payload.shipping.firstName = 123;
                    injectAndExpectStatusCode(server, request, 400);
                }());

                // invalid lastName
                (function() {
                    let request = Hoek.clone(goodRequest);
                    request.payload.shipping.lastName = 123;
                    injectAndExpectStatusCode(server, request, 400);
                }());

                // invalid company
                (function() {
                    let request = Hoek.clone(goodRequest);
                    request.payload.shipping.company = 123;
                    injectAndExpectStatusCode(server, request, 400);
                }());

                // invalid streetAddress
                (function() {
                    let request = Hoek.clone(goodRequest);
                    request.payload.shipping.streetAddress = 123;
                    injectAndExpectStatusCode(server, request, 400);
                }());

                // invalid extendedAddress
                (function() {
                    let request = Hoek.clone(goodRequest);
                    request.payload.shipping.extendedAddress = 123;
                    injectAndExpectStatusCode(server, request, 400);
                }());

                // invalid city
                (function() {
                    let request = Hoek.clone(goodRequest);
                    request.payload.shipping.city = 123;
                    injectAndExpectStatusCode(server, request, 400);
                }());

                // invalid state
                (function() {
                    let request = Hoek.clone(goodRequest);
                    request.payload.shipping.state = 123;
                    injectAndExpectStatusCode(server, request, 400);
                }());

                // invalid postalCode
                (function() {
                    let request = Hoek.clone(goodRequest);
                    request.payload.shipping.postalCode = 123;
                    injectAndExpectStatusCode(server, request, 400);
                }());

                // invalid countryCodeAlpha2
                (function() {
                    let request = Hoek.clone(goodRequest);
                    request.payload.shipping.countryCodeAlpha2 = 123;
                    injectAndExpectStatusCode(server, request, 400);
                }());

                // invalid email
                (function() {
                    let request = Hoek.clone(goodRequest);
                    request.payload.shipping.email = 123;
                    injectAndExpectStatusCode(server, request, 400);
                }());

                testHelpers.destroyKnexAndStopServer(server, done);
        });
    });


    it('should return 400 (Bad Request) when invalid billing data is sent', (done) => {
        let manifest = Hoek.clone(serverSetup.manifest);
        // manifest.registrations[0].plugin.options.customSessionIDGenerator = function(request) {
        //     return '12345';
        // };

        testHelpers
            .startServerAndGetHeaders(manifest, serverSetup.composeOptions)
            .then(({err, server, headers}) => {
                expect(err).not.to.exist();

                const goodRequest = {
                    method: 'POST',
                    url: '/cart/checkout',
                    headers,
                    payload: {
                        nonce: 'fake-valid-nonce',
                        billing: testHelpers.getFakeBillingAddress(),
                        shipping: testHelpers.getFakeShippingAddress()
                    }
                };

                (function() {
                    let request = Hoek.clone(goodRequest);
                    request.payload.billing = null;
                    injectAndExpectStatusCode(server, request, 400);
                }());

                // invalid firstName
                (function() {
                    let request = Hoek.clone(goodRequest);
                    request.payload.billing.firstName = 123;
                    injectAndExpectStatusCode(server, request, 400);
                }());

                // invalid lastName
                (function() {
                    let request = Hoek.clone(goodRequest);
                    request.payload.billing.lastName = 123;
                    injectAndExpectStatusCode(server, request, 400);
                }());

                // invalid company
                (function() {
                    let request = Hoek.clone(goodRequest);
                    request.payload.billing.company = 123;
                    injectAndExpectStatusCode(server, request, 400);
                }());

                // invalid streetAddress
                (function() {
                    let request = Hoek.clone(goodRequest);
                    request.payload.billing.streetAddress = 123;
                    injectAndExpectStatusCode(server, request, 400);
                }());

                // invalid extendedAddress
                (function() {
                    let request = Hoek.clone(goodRequest);
                    request.payload.billing.extendedAddress = 123;
                    injectAndExpectStatusCode(server, request, 400);
                }());

                // invalid city
                (function() {
                    let request = Hoek.clone(goodRequest);
                    request.payload.billing.city = 123;
                    injectAndExpectStatusCode(server, request, 400);
                }());

                // invalid state
                (function() {
                    let request = Hoek.clone(goodRequest);
                    request.payload.billing.state = 123;
                    injectAndExpectStatusCode(server, request, 400);
                }());

                // invalid postalCode
                (function() {
                    let request = Hoek.clone(goodRequest);
                    request.payload.billing.postalCode = 123;
                    injectAndExpectStatusCode(server, request, 400);
                }());

                // invalid countryCodeAlpha2
                (function() {
                    let request = Hoek.clone(goodRequest);
                    request.payload.billing.countryCodeAlpha2 = 123;
                    injectAndExpectStatusCode(server, request, 400);
                }());

                // invalid phone
                (function() {
                    let request = Hoek.clone(goodRequest);
                    request.payload.billing.phone = 123;
                    injectAndExpectStatusCode(server, request, 400);
                }());

                testHelpers.destroyKnexAndStopServer(server, done);
        });
    });

});
