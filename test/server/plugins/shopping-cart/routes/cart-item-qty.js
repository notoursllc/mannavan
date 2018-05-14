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


function updateQty(server, headers, id, qty) {
    return server.inject({
        method: 'POST',
        url: '/cart/item/qty',
        headers,
        payload: {
            id,
            qty
        }
    })    
}

describe('Testing route: POST /cart/item/qty', { timeout: 7000 }, () => {

    it('should update the qty for the respective cart item', (done) => {
        let manifest = Hoek.clone(serverSetup.manifest);

        testHelpers
            .startServerAndGetHeaders(manifest, serverSetup.composeOptions)
            .then(({err, server, headers}) => {
                expect(err).not.to.exist();

                let prodId = null;
                let cartItemId = null;

                // Get a random product
                // add product to the cart
                // update the qty of the cart item
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

                        return updateQty(server, headers, cartItemId, 3);
                    })
                    .then((res) => {
                        let cartData = res.result.data;
                        let newQty = null;

                        if(isObject(cartData) && Array.isArray(cartData.cart_items)) {
                            cartData.cart_items.forEach((item) => {
                                if(item.id === cartItemId) {
                                    newQty = item.qty;  
                                }
                            })   
                        }

                        expect(newQty).to.equal(3);
                        testHelpers.destroyKnexAndStopServer(server, done);
                    });
            });
    });


    it('should return 400 when updating an item that does not exist', (done) => {
        let manifest = Hoek.clone(serverSetup.manifest);

        testHelpers
            .startServerAndGetHeaders(manifest, serverSetup.composeOptions)
            .then(({err, server, headers}) => {
                expect(err).not.to.exist();

                updateQty(server, headers, 'abc', 2)
                    .then((res) => {
                        expect(res.statusCode, 'Status code').to.equal(400);
                        testHelpers.destroyKnexAndStopServer(server, done);
                    });
            });
    });

});
