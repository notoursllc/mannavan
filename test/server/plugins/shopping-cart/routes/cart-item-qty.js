const Lab = require('lab');
const Code = require('code');
const testHelpers = require('../../../testHelpers');
const isObject = require('lodash.isobject');
const { getServer } = require('../_controllerHelper');

const lab = exports.lab = Lab.script();
const describe = lab.experiment;
const expect = Code.expect;
const it = lab.test;


describe('Testing route: POST /cart/item/qty', { timeout: 7000 }, () => {

    it('should update the qty for the respective cart item', async() => {
        const server = await getServer();

        // Get a random product
        // Add product to the cart
        let productId = await testHelpers.getProduct(server);
        let { result } = await testHelpers.addToCart(server, productId);
        let { cart_items } = result.data;

        let cartItemId = null;
        if(Array.isArray(cart_items)) {
            cart_items.forEach((item) => {
                if(item.product_id === productId) {
                    cartItemId = item.id;
                }
            })
        }

        // Update the qty of the cart item
        let res = await server.inject({
            method: 'POST',
            url: '/cart/item/qty',
            headers: testHelpers.getRequestHeader(),
            payload: {
                id: cartItemId,
                qty: 3
            }
        });

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
    });


    it('should return 400 when updating an item that does not exist', async () => {
        const server = await getServer();

        let { statusCode } = await server.inject({
            method: 'POST',
            url: '/cart/item/qty',
            payload: {
                id: 'abc',
                qty: 2
            }
        })

        expect(statusCode, 'Status code').to.equal(400);
    });

});
