'use strict';

const Lab = require('lab');
const Code = require('code');

const ProductTypesService = require('../../../server/plugins/products/product-types.service');

const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;
const before = lab.before;
const expect = Code.expect;


// describe("Testing app-product-types.service", function() {
//
//     it("getTypes() return an object", function (done) {
//         var types = ProductTypesService.getTypes();
//
//         expect( types ).to.be.an.object();
//         expect( types ).to.include(
//             [
//                 'top',
//                 'hat',
//                 'short'
//             ]
//         );
//
//         done();
//     });
//
// });