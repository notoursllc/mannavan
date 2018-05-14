const Lab = require('lab');
const Code = require('code');
const testHelpers = require('../../../testHelpers');
const serverSetup = require('../_serverSetup');
const isObject = require('lodash.isobject');

const lab = exports.lab = Lab.script();
const describe = lab.experiment;
const expect = Code.expect;
const it = lab.test;


describe('Testing route: POST /cart/item/add', () => {

    it('adding a product to the cart should return a cart object containing the added product', { timeout: 5000 }, (done) => {
        testHelpers
            .startServerAndGetHeaders(serverSetup.manifest, serverSetup.composeOptions)
            .then(({err, server, headers}) => {
                expect(err).not.to.exist();

                let knownProductId = null;

                testHelpers
                    .getProduct(server, headers)
                    .then((productId) => {
                        knownProductId = productId;
                        return testHelpers.addToCart(server, headers, knownProductId);
                    })
                    .then((res) => {
                        let cartData = res.result.data;
                        let prodIsInCart = false;

                        expect(res.statusCode, 'Status code').to.equal(200);

                        if(isObject(cartData) && Array.isArray(cartData.cart_items)) {
                            cartData.cart_items.forEach((item) => {
                                if(item.product_id === knownProductId) {
                                    prodIsInCart = true;   
                                }
                            })   
                        }

                        expect(prodIsInCart).to.be.true();
                        testHelpers.destroyKnexAndStopServer(server, done);
                    });
            });
    });


    it('adding a product to the cart that already exists (same variants) should only update qty of that item in the cart', { timeout: 7000 }, (done) => {
        testHelpers
            .startServerAndGetHeaders(serverSetup.manifest, serverSetup.composeOptions)
            .then(({err, server, headers}) => {
                expect(err).not.to.exist();

                let numItems1 = null;
                let knownProductId = null;

                // Get a product
                // Add it to the cart
                // Get the qty of that product in the cart
                // Add the same product to the cart again
                // The cart item qty should be updated
                testHelpers
                    .getProduct(server, headers)
                    .then((productId) => {
                        knownProductId = productId;
                        return testHelpers.addToCart(server, headers, knownProductId);
                    })
                    .then((res) => {
                        let cartData = res.result.data;

                        // Get the number of items for the given product in the cart
                        if(isObject(cartData) && Array.isArray(cartData.cart_items)) {
                            cartData.cart_items.forEach((item) => {
                                if(item.product_id === knownProductId) {
                                    numItems1 = item.qty;
                                }
                            })   
                        }

                        // Add the same product to the cart (same variants) except qty = 2
                        return testHelpers.addToCart(
                            server, 
                            headers, 
                            knownProductId, 
                            {qty: 2, size: 'SIZE_ADULT_3XL'}
                        );
                    })
                    .then((res) => {
                        let cartData = res.result.data;
                        let numItems2 = 0;

                        if(isObject(cartData) && Array.isArray(cartData.cart_items)) {
                            cartData.cart_items.forEach((item) => {
                                if(item.product_id === knownProductId) {
                                    numItems2 += item.qty;
                                }
                            })   
                        }

                        expect(numItems1 + 2).to.equal(numItems2);
                        testHelpers.destroyKnexAndStopServer(server, done);
                    });
            });
    });


    it('adding a product to the cart that already exists (different variants) should add a new entry to the cart items', { timeout: 7000 }, (done) => {
        testHelpers
            .startServerAndGetHeaders(serverSetup.manifest, serverSetup.composeOptions)
            .then(({err, server, headers}) => {
                expect(err).not.to.exist();

                let knownProductId = null;

                // Get a product
                // Add it to the cart
                // Add the same product to the cart again (different variants)
                // There should be 2 items in the cart
                testHelpers
                    .getProduct(server, headers)
                    .then((productId) => {
                        knownProductId = productId;
                        return testHelpers.addToCart(
                            server, 
                            headers, 
                            knownProductId,
                            {qty: 1, size: 'SIZE_ADULT_3XL'}
                        );
                    })
                    .then((res) => {
                        // Add the same product to the cart (different variants)
                        return testHelpers.addToCart(
                            server, 
                            headers, 
                            knownProductId, 
                            {qty: 1, size: 'SIZE_ADULT_2XL'}
                        );
                    })
                    .then((res) => {
                        let cartData = res.result.data;
                        let numProdEntries = 0;
                        // console.log("CART", cartData)

                        if(isObject(cartData) && Array.isArray(cartData.cart_items)) {
                            cartData.cart_items.forEach((item) => {
                                if(item.product_id === knownProductId) {
                                    numProdEntries++
                                }
                            })   
                        }

                        expect(numProdEntries).to.equal(2);
                        testHelpers.destroyKnexAndStopServer(server, done);
                    });
            });
    });


    describe('should return a 400 error (Bad Request) when the payload is incorrect', () => {

        it('payload: id is not a string', (done) => {
            testHelpers
                .startServerAndGetHeaders(serverSetup.manifest, serverSetup.composeOptions)
                .then(({err, server, headers}) => {
                    expect(err).not.to.exist();

                    return server.inject({
                        method: 'POST',
                        url: '/cart/item/add',
                        headers,
                        payload: {
                            id: 123,
                            options: {
                                qty: 1,
                                size: 'SIZE_ADULT_3XL'
                            }
                        }
                    })
                    .then((res) => {
                        expect(res.statusCode, 'Status code').to.equal(400);
                        testHelpers.destroyKnexAndStopServer(server, done);
                    })
                });
        });

        it('payload: options.qty is not a number', (done) => {
            testHelpers
                .startServerAndGetHeaders(serverSetup.manifest, serverSetup.composeOptions)
                .then(({err, server, headers}) => {
                    expect(err).not.to.exist();

                    testHelpers
                        .getProduct(server, headers)
                        .then((productId) => {
                            return server.inject({
                                method: 'POST',
                                url: '/cart/item/add',
                                headers,
                                payload: {
                                    id: productId,
                                    options: {
                                        qty: 'abc',  // <----------------
                                        size: 'SIZE_ADULT_3XL'
                                    }
                                }
                            })
                        })
                        .then((res) => {
                            expect(res.statusCode, 'Status code').to.equal(400);
                            testHelpers.destroyKnexAndStopServer(server, done);
                        })
                });
        });

        it('payload: options.size is not a string', (done) => {
            testHelpers
                .startServerAndGetHeaders(serverSetup.manifest, serverSetup.composeOptions)
                .then(({err, server, headers}) => {
                    expect(err).not.to.exist();

                    testHelpers
                        .getProduct(server, headers)
                        .then((productId) => {
                            return server.inject({
                                method: 'POST',
                                url: '/cart/item/add',
                                headers,
                                payload: {
                                    id: productId,
                                    options: {
                                        qty: 1,
                                        size: 1   // <------------
                                    }
                                }
                            })
                        })
                        .then((res) => {
                            expect(res.statusCode, 'Status code').to.equal(400);
                            testHelpers.destroyKnexAndStopServer(server, done);
                        })
                });
        });

        it('payload is not sent', (done) => {
            testHelpers
                .startServerAndGetHeaders(serverSetup.manifest, serverSetup.composeOptions)
                .then(({err, server, headers}) => {
                    expect(err).not.to.exist();

                    return server.inject({
                        method: 'POST',
                        url: '/cart/item/add',
                        headers
                    })
                    .then((res) => {
                        expect(res.statusCode, 'Status code').to.equal(400);
                        testHelpers.destroyKnexAndStopServer(server, done);
                    })
                });
        });

    });

});
