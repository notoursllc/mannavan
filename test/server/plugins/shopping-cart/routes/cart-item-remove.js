const Lab = require('lab');
const Code = require('code');
const testHelpers = require('../../../testHelpers');
const { getServer } = require('../_controllerHelper');

const lab = exports.lab = Lab.script();
const describe = lab.experiment;
const expect = Code.expect;
const it = lab.test;


async function removeCartItem(server, id) {
    return await server.inject({
        method: 'POST',
        url: '/cart/item/remove',
        headers: testHelpers.getRequestHeader(),
        payload: {
            id
        }
    });
}


describe('Testing route: DELETE /cart/item/remove/{id}', () => {

    it('return a 400 when a string is sent as the param', async () => {
        const server = await getServer();

        let { statusCode } = await removeCartItem(server, 1);
        expect(statusCode, 'Status code').to.equal(400);
    });


    it('should remove the cart item from the cart after deleting it', { timeout: 5000 }, async () => {
        const server = await getServer();

        // Get a random product
        // Add it to the cart
        // Get the id of the cart item we just added
        // Delete the item from the cart

        let productId = await testHelpers.getProduct(server);
        let { result } = await testHelpers.addToCart(server, productId);
        let { cart_items } = result.data;
        // console.log("++CART ITEMS1", cart_items)

        // getting the id of the item we just added
        let cartItemId = null;
        if(Array.isArray(cart_items)) {
            cart_items.forEach((item) => {
                if(item.product_id === productId) {
                    cartItemId = item.id;
                }
            })
        }

        let res = await removeCartItem(server, cartItemId);
        let cartData = res.result.data;
        let itemExists = false;

        // making sure a cart item with cartItemId no longer exists in the cart
        if(Array.isArray(cartData.cart_items)) {
            cartData.cart_items.forEach((item) => {
                if(item.id === cartItemId) {
                    itemExists = true
                }
            })
        }

        expect(itemExists).to.be.equal(false);
    });


    it('should return 400 when removing an item that does not exist', async () => {
        const server = await getServer();

        let { statusCode } =  await removeCartItem(server, 'abc');
        expect(statusCode, 'Status code').to.equal(400);
    });

});
