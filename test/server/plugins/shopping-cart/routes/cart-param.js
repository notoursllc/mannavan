const Lab = require('lab');
const Code = require('code');
const testHelpers = require('../../../testHelpers');
const serverSetup = require('../_serverSetup');

const lab = exports.lab = Lab.script();
const describe = lab.experiment;
const expect = Code.expect;
const it = lab.test;


describe('Testing route: GET /cart/{param*}', () => {
    it('should return a 404 response', (done) => {
        testHelpers
            .startServerAndGetHeaders(serverSetup.manifest, serverSetup.composeOptions)
            .then(({err, server, headers}) => {
                expect(err).not.to.exist();

                const request = {
                    method: 'GET',
                    url: '/cart/foo',
                    headers
                };

                server.inject(request, (res) => {
                    expect(res.statusCode, 'Status code').to.equal(404);
                    testHelpers.destroyKnexAndStopServer(server, done);
                });
            });
    });
});
