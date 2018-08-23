const Lab = require('lab');
const Code = require('code');
const { getServer } = require('../_controllerHelper');

const lab = exports.lab = Lab.script();
const describe = lab.experiment;
const expect = Code.expect;
const it = lab.test;


describe('Testing route: GET /cart/get', () => {

    it('should contain the "virtual" attributes in the response', async () => {
        const server = await getServer();
        const res = await server.inject({
            method: 'GET',
            url: '/cart/get'
        });

        let data = res.result.data;
        expect(res.statusCode, 'Status code').to.equal(200);
        expect(data.hasOwnProperty('num_items')).to.equal(true);
        expect(data.hasOwnProperty('sub_total')).to.equal(true);
        expect(data.hasOwnProperty('grand_total')).to.equal(true);

        // Since nothing has been added to the cart yet
        // all of these values should equal zero:
        expect(data.num_items).to.equal(0);
        expect(data.sub_total).to.equal('0.00');
        expect(data.grand_total).to.equal('0.00');
    });

});
