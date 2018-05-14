const Code = require('code');
const Lab = require('lab');
const Hoek = require('hoek');
const BookshelfOrm = require('../../../server/plugins/bookshelf-orm');
const testHelpers = require('../../testHelpers');
const serverSetup = require('./_serverSetup');

const lab = exports.lab = Lab.script();
const describe = lab.experiment;
const expect = Code.expect;
const it = lab.test;


describe('Testing BookshelfOrm plugin', () => {

    // it('should have exposed methods under gmnst namespace when provided in plugin options', (done) => {
    //     const manifest = Hoek.clone(serverSetup.manifest);
    //     manifest.registrations[2].plugin.options = {};
    //     manifest.registrations[2].plugin.options.namespace = 'gmnst';
    //
    //     // removing unneeded plugins for this test
    //     manifest.registrations.splice(4, 1);
    //     manifest.registrations.splice(5, 1);
    //     manifest.registrations.splice(6, 1);
    //     manifest.registrations.splice(7, 1);
    //
    //     testHelpers
    //         .startServerAndGetHeaders(manifest, serverSetup.composeOptions)
    //         .then(({err, server, headers}) => {
    //             expect(err).not.to.exist();
    //             expect(server.plugins.BookshelfOrm.hasOwnProperty('gmnst')).to.be.true();
    //
    //             testHelpers.destroyKnexAndStopServer(server, done);
    //         });
    // });


    it('should have exposed methods under the "bookshelf" namespace when not provided in plugin options', (done) => {
        testHelpers
            .startServerAndGetHeaders(serverSetup.manifest, serverSetup.composeOptions)
            .then(({err, server, headers}) => {
                expect(err).not.to.exist();
                expect(server.app.hasOwnProperty('bookshelf')).to.be.true();

                testHelpers.destroyKnexAndStopServer(server, done);
            });
    });

});
