const Lab = require('lab');
const Code = require('code');
const testHelpers = require('../../../testHelpers');
const serverSetup = require('../_serverSetup');

const lab = exports.lab = Lab.script();
const describe = lab.experiment;
const expect = Code.expect;
const it = lab.test;


describe('Testing route: GET /cart/get', () => {
    // it('should have a Yar object on the request', (done) => {
    //     testHelpers
    //         .startServerAndGetHeaders(serverSetup.manifest, serverSetup.composeOptions)
    //         .then(({err, server, headers}) => {
    //             expect(err).not.to.exist();

    //             const request = {
    //                 method: 'GET',
    //                 url: '/cart/get',
    //                 headers
    //             };

    //             server.inject(request, (res) => {
    //                 expect(res.statusCode, 'Status code').to.equal(200);
    //                 // expect(res.request.yar).to.be.an.object();
    //                 // expect(res.request.yar.hasOwnProperty('id')).to.equal(true);

    //                 testHelpers.destroyKnexAndStopServer(server, done);
    //             });
    //     });
    // });


    it('should contain the "virtual" attributes in the response', (done) => {
        testHelpers
            .startServerAndGetHeaders(serverSetup.manifest, serverSetup.composeOptions)
            .then(({err, server, headers}) => {
                expect(err).not.to.exist();

                const request = {
                    method: 'GET',
                    url: '/cart/get',
                    headers
                };

                server.inject(request, (res) => {
                    // let data = JSON.parse(JSON.stringify(res.result.data));
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

                    testHelpers.destroyKnexAndStopServer(server, done);
                });
            });
    });
    
});
