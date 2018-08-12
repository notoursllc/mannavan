const { expect } = require('code');
const Lab = require('lab');
const { after, before, describe, it } = exports.lab = Lab.script();
const ShippoOrdersAPI = require('../../../../../server/plugins/shipping/shippoAPI/orders');

let orderId = null;


describe('Shipping Orders: listAllOrders()', () => {

    it('should return an array', async () => {
        let orders = null;
        let error = null;

        try {
            orders = await ShippoOrdersAPI.listAllOrders();
        }
        catch(err) {
            error = err;
            console.log(err)
        }

        expect( orders ).to.be.an.array();
        expect( error ).not.to.be.an.object();
    });

});


describe('Shipping Orders: createOrder()', () => {

    it('should return an object', async () => {
        let order = null;
        let error = null;

        const data = {
            "to_address": {
                "city": "San Francisco",
                "company": "Shippo",
                "country": "US",
                "email": "shippotle@goshippo.com",
                "name": "Mr Hippo",
                "phone": "15553419393",
                "state": "CA",
                "street1": "215 Clayton St.",
                "zip": "94117"
            },
            "line_items": [
                {
                    "quantity": 1,
                    "sku": "HM-123",
                    "title": "Hippo Magazines",
                    "total_price": "12.10",
                    "currency": "USD",
                    "weight": "0.40",
                    "weight_unit": "lb"
                }
            ],
            "placed_at": "2016-09-23T01:28:12Z",
            "order_number": "#1068",
            "order_status": "PAID",
            "shipping_cost": "12.83",
            "shipping_cost_currency": "USD",
            "shipping_method": "USPS First Class Package",
            "subtotal_price": "12.10",
            "total_price": "24.93",
            "total_tax": "0.00",
            "currency": "USD",
            "weight": "0.40",
            "weight_unit": "lb"
        };

        try {
            order = await ShippoOrdersAPI.createOrder(data);
            orderId = order.object_id;
        }
        catch(err) {
            error = err;
            console.log(err)
        }

        expect( order ).to.be.an.object();
        expect( order.object_id ).to.be.an.string();
        expect( error ).not.to.be.an.object();
    });

});


describe('Shipping Orders: getOrder()', () => {

    it('should return an object', async () => {
        let order = null;
        let error = null;

        try {
            order = await ShippoOrdersAPI.getOrder(orderId);
        }
        catch(err) {
            error = err;
            console.log(err)
        }

        expect( order ).to.be.an.object();
        expect( order.object_id ).to.equal( orderId );
        expect( error ).not.to.be.an.object();
    });

});
