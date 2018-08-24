'use strict';

const { expect } = require('code');
const Lab = require('lab');
const { after, before, describe, it } = exports.lab = Lab.script();

const faker = require('faker');
const { initController } = require('../_controllerHelper');


describe('Testing controller method: saveShippoOrder', () => {

    it('should return a ShoppingCartToShippoOrderObject upon saving successfully', async (done) => {
        const { controller, server } = await initController();

        const { result } = await server.inject({
            method: 'GET',
            url: '/cart/get'
        });

        // console.log("CART DATA", result.data)
        expect( result.data ).to.be.an.object();

        const ShoppingCartToShippoOrder = await controller.saveShippoOrder(
            result.data.id,
            { "test": "test2" }
        );

        expect( ShoppingCartToShippoOrder ).to.be.an.object();
        // console.log("+++++++++++ ShoppingCartToShippoOrder", ShoppingCartToShippoOrder)

        const jsonObj = ShoppingCartToShippoOrder.get('shippo_order');
        expect( jsonObj.test ).to.equal('test2')
    });


    it('should return an error if the cart ID is not a foreign key of a cart', async (done) => {
        const { controller, server } = await initController();
        let ShoppingCartToShippoOrder = null;
        let error = null;

        try {
            ShoppingCartToShippoOrder = await controller.saveShippoOrder(
                faker.random.uuid(),
                { "test": "test2" }
            );
        }
        catch(err) {
            error = err;
            // console.log("ERROR", err)
        }

        expect( ShoppingCartToShippoOrder ).not.to.be.an.object();
        expect( error ).to.be.an.object();
    });

});
