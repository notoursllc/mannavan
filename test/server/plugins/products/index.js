const Code = require('code');
const Lab = require('lab');
const Hoek = require('hoek');
const Products = require('../../../../server/plugins/products');
const BookshelfOrm = require('../../../../server/plugins/bookshelf-orm');
const testHelpers = require('../../testHelpers');
const serverSetup = require('./_serverSetup');

const lab = exports.lab = Lab.script();
const describe = lab.experiment;
const expect = Code.expect;
const it = lab.test;


describe('Testing Products plugin', () => {

    it('errors on missing BookshelfOrm plugin', (done) => {
        const manifest = Hoek.clone(serverSetup.manifest);
        testHelpers.spliceRegistrationFromManifest('./plugins/bookshelf-orm', manifest);

        testHelpers
            .startServerAndGetHeaders(manifest, serverSetup.composeOptions)
            .then(({err, server}) => {
                expect(err).to.exist();
                expect(err.message).to.include(`missing dependency ${BookshelfOrm.register.attributes.name}`);

                server.stop(done);
            });
    });


    it('should have models', (done) => {
        testHelpers
            .startServerAndGetHeaders(serverSetup.manifest, serverSetup.composeOptions)
            .then(({err, server}) => {
                expect(err).not.to.exist();
                expect(server.app.bookshelf.model('Product')).to.be.a.function();
                expect(server.app.bookshelf.model('ProductArtist')).to.be.a.function();
                expect(server.app.bookshelf.model('ProductPic')).to.be.a.function();
                expect(server.app.bookshelf.model('ProductSize')).to.be.a.function();

                testHelpers.destroyKnexAndStopServer(server, done);
            });
    });

});
