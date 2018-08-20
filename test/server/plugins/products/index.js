const Code = require('code');
const Lab = require('lab');
const { getServer } = require('./_controllerHelper');

const lab = exports.lab = Lab.script();
const describe = lab.experiment;
const expect = Code.expect;
const it = lab.test;


describe('Testing Products plugin', () => {

    it('should have models', async (s) => {
        const server = await getServer();

        expect(server.app.bookshelf.model('Product')).to.be.a.function();
        expect(server.app.bookshelf.model('ProductArtist')).to.be.a.function();
        expect(server.app.bookshelf.model('ProductPic')).to.be.a.function();
        expect(server.app.bookshelf.model('ProductPicVariant')).to.be.a.function();
        expect(server.app.bookshelf.model('ProductSize')).to.be.a.function();
    });

});
