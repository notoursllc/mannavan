const { expect } = require('code');
const Lab = require('lab');
const { after, before, describe, it } = exports.lab = Lab.script();

const Hoek = require('hoek');
const testHelpers = require('../../../testHelpers');
const serverSetup = require('../_serverSetup');

const { getServer, getController, getShipmentData } = require('./_shippingControllerHelper');
const ShoppingCartMock = require('../../shopping-cart/ShoppingCartMock');
const shippingController = getController();



async function expectErrorOnMissingShippingArgument(arg) {
    const server = await getServer();
    shippingController.setServer(server);

    let data = getShipmentData();
    delete data[arg];

    let res = null;
    let error = null;

    try {
        res = await shippingController.createShipment(data)
    }
    catch(err) {
        error = err;
    }

    expect( res ).not.to.be.an.object();
    expect( error ).to.be.an.object();
    expect( error.message ).to.include(`The data you sent was not accepted as valid`);

    server.stop();
}


async function expectErrorOnMissingAddressArgument(key, addressProp) {
    const server = await getServer();
    shippingController.setServer(server);

    let data = getShipmentData();
    delete data[key][addressProp];

    let res = null;
    let error = null;

    try {
        res = await shippingController.createShipment(data)
    }
    catch(err) {
        error = err;
    }

    expect( res ).not.to.be.an.object();
    expect( error ).to.be.an.object();
    expect( error.message ).to.include(`The data you sent was not accepted as valid`);

    server.stop();
}


describe('Shipping Controller: createShipment()', () => {

    /*
    it('errors on missing "address_from" value', async () => {
        expectErrorOnMissingShippingArgument('address_from')
    });


    it('errors on missing "address_to" value', async () => {
        expectErrorOnMissingShippingArgument('address_to')
    });


    it('errors on missing "address_to" value', async () => {
        expectErrorOnMissingShippingArgument('parcels')
    });


    it('errors on missing "name" value in address', async () => {
        expectErrorOnMissingAddressArgument('address_to', 'name')
        expectErrorOnMissingAddressArgument('address_from', 'name')
    });


    it('errors on missing "street1" value in address', async () => {
        expectErrorOnMissingAddressArgument('address_to', 'street1')
        expectErrorOnMissingAddressArgument('address_from', 'street1')
    });


    it('errors on missing "city" value in address', async () => {
        expectErrorOnMissingAddressArgument('address_to', 'city')
        expectErrorOnMissingAddressArgument('address_from', 'city')
    });


    it('errors on missing "state" value in address', async () => {
        expectErrorOnMissingAddressArgument('address_to', 'state')
        expectErrorOnMissingAddressArgument('address_from', 'state')
    });


    it('errors on missing "zip" value in address', async () => {
        expectErrorOnMissingAddressArgument('address_to', 'zip')
        expectErrorOnMissingAddressArgument('address_from', 'zip')
    });


    it('errors on missing "country" value in address', async () => {
        expectErrorOnMissingAddressArgument('address_to', 'country')
        expectErrorOnMissingAddressArgument('address_from', 'country')
    });


    it('errors if "country" value in "address_from" is not a 2-character code', async () => {
        async function countryTest(addressKey) {
            let data = getShipmentData();
            data[addressKey].country = 'USA';

            let shipment = null;
            let error = null;

            try {
                shipment = await shippingController.createShipment(data)
            }
            catch(err) {
                error = err;
            }

            expect( shipment ).not.to.be.an.object();
            expect( error ).to.be.an.object();
            expect( error.message ).to.include('"country" length must be 2 characters long');
        }

        await countryTest('address_to');
        await countryTest('address_from');
    });
*/

    it('errors on shipment_date if not a ISO-8601 value', async () => {
        const server = await getServer();
        shippingController.setServer(server);

        let data = getShipmentData();
        // data.shipment_date = '123';

        let shipment = null;
        let error = null;

        try {
            shipment = await shippingController.createShipment(data);
        }
        catch(err) {
            error = err;
            // console.log("ISO - ERR", err)
        }

        expect( shipment ).not.to.be.an.object();
        // expect( error ).to.be.an.object();
        expect( error.message ).to.include('The data you sent was not accepted as valid');

        server.stop();
    });


    // the controller method calls toJSON on the cart_items object,
    // so mocking that here
    function getMockCartWithCartItems(items) {
        const cartItems = {
            toJSON: function() {
                return items
            }
        };

        return new ShoppingCartMock({
            cart_items: cartItems
        });
    }


    it('should create a Parcel object from a ShoppingCart', async () => {
        const server = await getServer();
        shippingController.setServer(server);

        let parcels = null;
        let error = null;

        try {
            parcels = await shippingController.createParcelsFromShoppingCart(
                getMockCartWithCartItems([
                    { product: { weight_oz: 5, shipping_package_type: 1 } }
                ])
            );
        }
        catch(err) {
            error = err;
            console.log(err)
        }

        // console.log("PARCELS", parcels)

        expect( parcels ).to.be.an.array();
        expect( parcels.length ).to.equal(1);
        expect( error ).not.to.be.an.object();

        server.stop();
    });


    it('should create 2 Parcel objects from a ShoppingCart with cart items with different package types defined', async () => {
        const server = await getServer();
        shippingController.setServer(server);

        let parcels = null;
        let error = null;

        try {
            parcels = await shippingController.createParcelsFromShoppingCart(
                getMockCartWithCartItems([
                    { product: { weight_oz: 5, shipping_package_type: 1 } },
                    { product: { weight_oz: 7, shipping_package_type: 2 } }
                ])
            );
        }
        catch(err) {
            error = err;
            console.log(err)
        }

        // console.log("PARCELS", parcels)

        expect( parcels ).to.be.an.array();
        expect( parcels.length ).to.equal(2);
        expect( error ).not.to.be.an.object();

        server.stop();
    });


    it('should create 1 Parcel object from a ShoppingCart with cart items with the same package types defined', async () => {
        const server = await getServer();
        shippingController.setServer(server);

        let parcels = null;
        let error = null;

        try {
            parcels = await shippingController.createParcelsFromShoppingCart(
                getMockCartWithCartItems([
                    { product: { weight_oz: 5, shipping_package_type: 1 } },
                    { product: { weight_oz: 7, shipping_package_type: 1 } },
                    { product: { weight_oz: 4, shipping_package_type: 1 } }
                ])
            );
        }
        catch(err) {
            error = err;
            console.log(err)
        }

        // console.log("PARCELS", parcels)

        expect( parcels ).to.be.an.array();
        expect( parcels.length ).to.equal(1);
        expect( error ).not.to.be.an.object();

        server.stop();
    });
});
