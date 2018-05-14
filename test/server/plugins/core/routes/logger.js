const Lab = require('lab');
const Code = require('code');
const testHelpers = require('../../../testHelpers');
const serverSetup = require('../_serverSetup');

const lab = exports.lab = Lab.script();
const describe = lab.experiment;
const expect = Code.expect;
const it = lab.test;


describe('Testing route: POST /logger', () => {

    // it('returns 200 response', (done) => {
    //     testHelpers
    //         .startServerAndGetHeaders(serverSetup.manifest, serverSetup.composeOptions)
    //         .then(({err, server, headers}) => {
    //             expect(err).not.to.exist();

    //             const request = {
    //                 method: 'POST',
    //                 url: 'api/v1/logger',
    //                 headers,
    //                 payload: {
    //                     type: 'error',
    //                     message: 'TEST MESSAGE'
    //                 }
    //             };

    //             server.inject(request, (res) => {
    //                 // console.log("RES", res)
    //                 expect(res.statusCode, 'Status code').to.equal(200);
    //                 testHelpers.destroyKnexAndStopServer(server, done);
    //             });
    //         });
    // });

});
