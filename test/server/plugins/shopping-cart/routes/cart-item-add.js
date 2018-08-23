const Lab = require('lab');
const Code = require('code');
const testHelpers = require('../../../testHelpers');
const isObject = require('lodash.isobject');
const { getServer } = require('../_controllerHelper');

const lab = exports.lab = Lab.script();
const describe = lab.experiment;
const expect = Code.expect;
const it = lab.test;


describe('Testing route: POST /cart/item/add', () => {

    it('adding a product to the cart should return a cart object containing the added product', { timeout: 5000 }, async () => {
        const server = await getServer();

        let error = null;
        let prodIsInCart = false;

        try {
            let knownProductId = await testHelpers.getProduct(server);
            let res = await testHelpers.addToCart(server, knownProductId);
            let cartData = res.result.data;

            if(isObject(cartData) && Array.isArray(cartData.cart_items)) {
                cartData.cart_items.forEach((item) => {
                    if(item.product_id === knownProductId) {
                        prodIsInCart = true;
                    }
                })
            }

            expect(res.statusCode, 'Status code').to.equal(200);
        }
        catch(err) {
            error = err;
        }

        expect(prodIsInCart).to.be.true();
        expect(error).to.equal(null);
    });


    // THIS TEST IS BROKEN
    // because the request is not sending basic auth credentials, thus the two 'addToCart' requests
    // made in this test return a new shopping cart for each request
    it('adding a product to the cart that already exists (same variants) should only update qty of that item in the cart', { timeout: 7000 }, async () => {
        const server = await getServer();
        let numItems1 = null;

        // Get a product
        // Add it to the cart
        // Get the qty of that product in the cart
        // Add the same product to the cart again
        // The cart item qty should be updated

        let knownProductId = await testHelpers.getProduct(server);
        let res = await testHelpers.addToCart(server, knownProductId);
        let cartData = res.result.data;

        // console.log("CARTDATA1a", cartData)

        // Get the number of items for the given product in the cart
        if(isObject(cartData) && Array.isArray(cartData.cart_items)) {
            cartData.cart_items.forEach((item) => {
                if(item.product_id === knownProductId) {
                    numItems1 = item.qty;
                }
            })
        }

        // Add the same product to the cart (same variants) except qty = 2
        let { result } = await testHelpers.addToCart(
            server,
            knownProductId,
            {qty: 2, size: 'SIZE_ADULT_3XL'}
        );
        // console.log("CARTDATA2", result.data)

        let { cart_items } = result.data;
        let numItems2 = 0;

        if(Array.isArray(cart_items)) {
            cart_items.forEach((item) => {
                if(item.product_id === knownProductId) {
                    numItems2 += item.qty;
                }
            })
        }

        expect(numItems1 + 2).to.equal(numItems2);
    });


    it('adding a product to the cart that already exists (different variants) should add a new entry to the cart items', { timeout: 7000 }, async () => {
        const server = await getServer();
        let error = null;

        try {
            let knownProductId = await testHelpers.getProduct(server);
            await testHelpers.addToCart(
                server,
                knownProductId,
                {qty: 1, size: 'SIZE_ADULT_3XL'}
            );

            // Add the same product to the cart (different variants)
            let { result } = await testHelpers.addToCart(
                server,
                knownProductId,
                {qty: 1, size: 'SIZE_ADULT_2XL'}
            );

            let { cart_items } = result.data;
            let numProdEntries = 0;

            if(Array.isArray(cart_items)) {
                cart_items.forEach((item) => {
                    if(item.product_id === knownProductId) {
                        numProdEntries++
                    }
                })
            }

            expect(numProdEntries).to.equal(2);
        }
        catch(err) {
            error = err;
        }

        expect(error).to.equal(null);
    });



    describe('should return a 400 error (Bad Request) when the payload is incorrect', () => {
        it('payload: id is not a string', async (done) => {
            const server = await getServer();
            let error = null;

            try {
                let { statusCode } = await server.inject({
                    method: 'POST',
                    url: '/cart/item/add',
                    payload: {
                        id: 123,
                        options: {
                            qty: 1,
                            size: 'SIZE_ADULT_3XL'
                        }
                    }
                });

                expect(statusCode, 'Status code').to.equal(400);
            }
            catch(err) {
                error = err;
            }

            expect(error).to.equal(null);
        });


        it('payload: options.qty is not a number', async() => {
            const server = await getServer();
            let error = null;

            try {
                let productId = await testHelpers.getProduct(server);
                let { statusCode } = await server.inject({
                    method: 'POST',
                    url: '/cart/item/add',
                    payload: {
                        id: productId,
                        options: {
                            qty: 'abc',  // <=======================
                            size: 'SIZE_ADULT_3XL'
                        }
                    }
                });

                expect(statusCode, 'Status code').to.equal(400);
            }
            catch(err) {
                error = err;
            }

            expect(error).to.equal(null);
        });


        it('payload: options.size is not a string', async () => {
            const server = await getServer();
            let error = null;

            try {
                let productId = await testHelpers.getProduct(server);
                let { statusCode } = await server.inject({
                    method: 'POST',
                    url: '/cart/item/add',
                    payload: {
                        id: productId,
                        options: {
                            qty: 1,
                            size: 1   // <=================
                        }
                    }
                });

                expect(statusCode, 'Status code').to.equal(400);
            }
            catch(err) {
                error = err;
            }

            expect(error).to.equal(null);
        });


        it('payload is not sent', async () => {
            const server = await getServer();
            let error = null;

            try {
                let { statusCode } = await server.inject({
                    method: 'POST',
                    url: '/cart/item/add',
                })

                expect(statusCode, 'Status code').to.equal(400);
            }
            catch(err) {
                error = err;
            }

            expect(error).to.equal(null);
        });
    });

});
