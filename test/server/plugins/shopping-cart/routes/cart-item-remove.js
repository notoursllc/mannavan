const Lab = require('lab');
const Code = require('code');
const Hoek = require('hoek');
const testHelpers = require('../../../testHelpers');
const serverSetup = require('../_serverSetup');
const isObject = require('lodash.isobject');

const lab = exports.lab = Lab.script();
const describe = lab.experiment;
const expect = Code.expect;
const it = lab.test;


function deleteItem(server, headers, id) {
    return server.inject({
        method: 'POST',
        url: '/cart/item/remove',
        headers,
        payload: {
            id
        }
    })
}


describe('Testing route: DELETE /cart/item/remove/{id}', () => {

    it('return a 400 when a string is sent as the param', (done) => {
        testHelpers
            .startServerAndGetHeaders(serverSetup.manifest, serverSetup.composeOptions)
            .then(({err, server, headers}) => {
                expect(err).not.to.exist();

                deleteItem(server, headers, 1)
                    .then((res) => {
                        expect(res.statusCode, 'Status code').to.equal(400);
                        testHelpers.destroyKnexAndStopServer(server, done);
                    })
            });
    });


    it('should remove the cart item from the cart after deleting it', { timeout: 5000 }, (done) => {
        let manifest = Hoek.clone(serverSetup.manifest);
        // manifest.registrations[0].plugin.options.customSessionIDGenerator = function(request) {
        //     return 'abcde';
        // };

        testHelpers
            .startServerAndGetHeaders(manifest, serverSetup.composeOptions)
            .then(({err, server, headers}) => {
                expect(err).not.to.exist();

                let prodId = null;
                let cartItemId = null;

                // Get a random product
                // Add it to the cart
                // Get the id of the cart item we just added
                // Delete the item from the cart
                testHelpers
                    .getProduct(server, headers)
                    .then((productId) => {
                        prodId = productId;
                        return testHelpers.addToCart(server, headers, productId);
                    })
                    .then((res) => {
                        let cartData = res.result.data;

                        if(isObject(cartData) && Array.isArray(cartData.cart_items)) {
                            cartData.cart_items.forEach((item) => {
                                if(item.product_id === prodId) {
                                    cartItemId = item.id;   
                                }
                            })   
                        }

                        return deleteItem(server, headers, cartItemId)
                    })
                    .then((res) => {
                        let cartData = res.result.data;
                        expect(cartData.cart_items.length).to.be.equal(0);
                        testHelpers.destroyKnexAndStopServer(server, done);
                    });
            });
    });


    it('should return 400 when removing an item that does not exist', (done) => {
        let manifest = Hoek.clone(serverSetup.manifest);

        testHelpers
            .startServerAndGetHeaders(manifest, serverSetup.composeOptions)
            .then(({err, server, headers}) => {
                expect(err).not.to.exist();

                deleteItem(server, headers, 'abc')
                    .then((res) => {
                        expect(res.statusCode, 'Status code').to.equal(400);
                        testHelpers.destroyKnexAndStopServer(server, done);
                    });
            });
    });

});
