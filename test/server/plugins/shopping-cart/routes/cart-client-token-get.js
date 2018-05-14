const Lab = require('lab');
const Code = require('code');
const jwt = require('jsonwebtoken');
const testHelpers = require('../../../testHelpers');
const serverSetup = require('../_serverSetup');

const lab = exports.lab = Lab.script();
const describe = lab.experiment;
const expect = Code.expect;
const it = lab.test;


describe('Testing route: GET /cart/client-token/get', () => {

    it('should get a JWT token', (done) => {
        Server.init(serverSetup.manifest, serverSetup.composeOptions, (err, server) => {
            expect(err).to.not.exist();

            server.inject({
                method: 'GET',
                url: '/cart/client-token/get'
            })
            .then((res) => {
                expect(res.statusCode, 'Status code').to.equal(200);
                expect(res.headers.hasOwnProperty('authorization')).to.equal(true);

                let decoded = jwt.decode(res.headers['authorization']);
                expect(decoded.clientId).to.equal(process.env.JWT_CLIENT_ID);
                expect(decoded.hasOwnProperty('jti')).to.equal(true);

                testHelpers.destroyKnexAndStopServer(server, done);
            })
        });
    });

});
