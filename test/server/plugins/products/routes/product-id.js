const Lab = require('lab');
const Code = require('code');
const _ = require('lodash');
const testHelpers = require('../../../testHelpers');
const serverSetup = require('../_serverSetup');

const lab = exports.lab = Lab.script();
const describe = lab.experiment;
const expect = Code.expect;
const it = lab.test;

let routePrefix = testHelpers.getApiPrefix();


describe('Testing route: GET /product/{id}', () => {

    it('returns a product when passed an ID', (done) => {
        testHelpers
            .startServerAndGetHeaders(serverSetup.manifest, serverSetup.composeOptions)
            .then(({err, server, headers}) => {
                expect(err).not.to.exist();

                const Product = server.app.bookshelf.model('Product');
                const attributes = {
                    title: 'title',
                    description_short: 'description_short',
                    description_long: 'description_long',
                    sku: 'sku'
                };

                Product
                    .forge()
                    .save(attributes)
                    .then((Prod) => {
                        let p = Prod.toJSON();

                        const request = {
                            method: 'GET',
                            url: `${routePrefix}/product?id=${p.id}`,
                            headers
                        };

                        server.inject(request, (res) => {
                            let prod = res.result.data.attributes;
                            expect(res.statusCode, 'Status code').to.equal(200);
                            expect(prod).to.be.an.object();

                            _.forEach(attributes, (val, key) => {
                                expect(prod[key]).to.equal(attributes[key]);
                            });

                            // clean up
                            Prod.destroy().finally(() => {
                                testHelpers.destroyKnexAndStopServer(server, done);
                            });
                        });
                    });
            });
    });


    it('returns a 400 when not passed an ID', (done) => {
        testHelpers
            .startServerAndGetHeaders(serverSetup.manifest, serverSetup.composeOptions)
            .then(({err, server, headers}) => {
                expect(err).not.to.exist();

                const request = {
                    method: 'GET',
                    url: '${routePrefix}/product?id=',
                    headers
                };

                server.inject(request, (res) => {
                    expect(res.statusCode, 'Status code').to.equal(400);
                    testHelpers.destroyKnexAndStopServer(server, done);
                });
            });
    });


    it('returns a 400 (Bad Request) when ID is a number', (done) => {
        testHelpers
            .startServerAndGetHeaders(serverSetup.manifest, serverSetup.composeOptions)
            .then(({err, server, headers}) => {
                expect(err).not.to.exist();

                const request = {
                    method: 'GET',
                    url: '${routePrefix}/product?id=123',
                    headers
                };

                server.inject(request, (res) => {
                    expect(res.statusCode, 'Status code').to.equal(400);
                    testHelpers.destroyKnexAndStopServer(server, done);
                });
            });
    });


    it('returns a 400 (Bad Request) when ID is not a UUID', (done) => {
        testHelpers
            .startServerAndGetHeaders(serverSetup.manifest, serverSetup.composeOptions)
            .then(({err, server, headers}) => {
                expect(err).not.to.exist();

                const request = {
                    method: 'GET',
                    url: '${routePrefix}/product?id=abc',
                    headers
                };

                server.inject(request, (res) => {
                    expect(res.statusCode, 'Status code').to.equal(400);
                    testHelpers.destroyKnexAndStopServer(server, done);
                });
            });
    });


    it('returns a 200 when ID does not exist', (done) => {
        testHelpers
            .startServerAndGetHeaders(serverSetup.manifest, serverSetup.composeOptions)
            .then(({err, server, headers}) => {
                expect(err).not.to.exist();

                const request = {
                    method: 'GET',
                    url: `${routePrefix}/product?id=2e8d31fd-dbde-4e65-8172-a7b7bbf1619e`,
                    headers
                };

                server.inject(request, (res) => {
                    let data = JSON.parse(JSON.stringify(res.result.data));

                    expect(res.statusCode, 'Status code').to.equal(200);
                    expect(data).to.equal(null);

                    testHelpers.destroyKnexAndStopServer(server, done);
                });
            });
    });

});
