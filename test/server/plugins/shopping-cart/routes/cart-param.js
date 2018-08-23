const Lab = require('lab');
const Code = require('code');
const { getServer } = require('../_controllerHelper');

const lab = exports.lab = Lab.script();
const describe = lab.experiment;
const expect = Code.expect;
const it = lab.test;


describe('Testing route: GET /cart/{param*}', () => {

    it('should return a 404 response', async () => {
        const server = await getServer();

        let { statusCode } = await server.inject({
            method: 'GET',
            url: '/cart/foo'
        });

        expect(statusCode, 'Status code').to.equal(404);
    });

});
