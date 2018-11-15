const Lab = require('lab');
const Code = require('code');
const queryString = require('query-string');
const testHelpers = require('../../../testHelpers');
const { initProductsController } = require('../_controllerHelper');

const lab = exports.lab = Lab.script();
const describe = lab.experiment;
const expect = Code.expect;
const it = lab.test;

let routePrefix = testHelpers.getApiPrefix();


describe('Testing route: GET /products', () => {
    it('should get a list of products', async () => {
        const { server } = await initProductsController();

        const paramString = queryString.stringify(
            {
                where: ['is_available', '=', true],
                whereRaw: ['sub_type & ? > 0', [2]],
                andWhere: [
                    ['inventory_count', '>', 0]
                ],
                orderBy: 'updated_at',
                orderDir: 'DESC'
            },
            { arrayFormat: 'bracket' }
        );

        const { statusCode } = await server.inject({
            method: 'GET',
            url: `${routePrefix}/products?${paramString}`
        });

        expect(statusCode, 'Status code').to.equal(200);
    });


    it('product should have related info (artist, category, sizes, etc)', async () => {
        const { server } = await initProductsController();

        const paramString = queryString.stringify(
            {
                where: ['is_available', '=', true],
                limit: 1
            },
            { arrayFormat: 'bracket' }
        );

        const res = await server.inject({
            method: 'GET',
            url: `${routePrefix}/products?${paramString}`,
        });

        let data = JSON.parse(JSON.stringify(res.result.data));
        let prod = data[0];

        expect(res.statusCode, 'Status code').to.equal(200);
        expect(prod.hasOwnProperty('sizes'), 'Related info: sizes').to.equal(true);
        expect(prod.hasOwnProperty('artist'), 'Related info: artist').to.equal(true);
        expect(prod.hasOwnProperty('pics'), 'Related info: pics').to.equal(true);
        expect(prod.hasOwnProperty('type'), 'Related info: type').to.equal(true);
        expect(prod.hasOwnProperty('sub_type'), 'Related info: sub_type').to.equal(true);
        expect(prod.hasOwnProperty('fit'), 'Related info: fit').to.equal(true);
    });
});
