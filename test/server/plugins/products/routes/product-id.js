const Lab = require('lab');
const Code = require('code');
const _ = require('lodash');
const testHelpers = require('../../../testHelpers');
const { initProductsController } = require('../_controllerHelper');

const lab = exports.lab = Lab.script();
const describe = lab.experiment;
const expect = Code.expect;
const it = lab.test;

let routePrefix = testHelpers.getApiPrefix();


describe('Testing route: GET /product/{id}', () => {

    it('returns a product when passed an ID', async () => {
        const { server } = await initProductsController();

        const Product = server.app.bookshelf.model('Product');
        const attributes = {
            title: 'title',
            description_short: 'description_short',
            description_long: 'description_long',
            sku: 'sku'
        };

        let Prod = await Product.forge().save(attributes);
        let p = Prod.toJSON();

        const request = {
            method: 'GET',
            url: `${routePrefix}/product?id=${p.id}`
        };

        const res = await server.inject(request);
        const prod = res.result.data.attributes;

        expect(res.statusCode, 'Status code').to.equal(200);
        expect(prod).to.be.an.object();

        _.forEach(attributes, (val, key) => {
            expect(prod[key]).to.equal(attributes[key]);
        });

        // clean up
        Prod.destroy();
    });


    it('returns a 400 when not passed an ID', async () => {
        const { server } = await initProductsController();

        const { statusCode } = await server.inject({
            method: 'GET',
            url: '${routePrefix}/product?id='
        });

        expect(statusCode, 'Status code').to.equal(400);
    });


    it('returns a 400 (Bad Request) when ID is a number', async () => {
        const { server } = await initProductsController();

        const { statusCode } = await server.inject({
            method: 'GET',
            url: '${routePrefix}/product?id=123',
        })

        expect(statusCode, 'Status code').to.equal(400);
    });


    it('returns a 400 (Bad Request) when ID is not a UUID', async () => {
        const { server } = await initProductsController();

        const { statusCode } = await server.inject({
            method: 'GET',
            url: '${routePrefix}/product?id=abc',
        });

        expect(statusCode, 'Status code').to.equal(400);
    });


    it('returns a 200 when ID does not exist', async () => {
        const { server } = await initProductsController();

        const res = await server.inject({
            method: 'GET',
            url: `${routePrefix}/product?id=2e8d31fd-dbde-4e65-8172-a7b7bbf1619e`
        });

        let data = JSON.parse(JSON.stringify(res.result.data));

        expect(res.statusCode, 'Status code').to.equal(200);
        expect(data).to.equal(null);
    });

});
