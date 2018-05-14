'use strict';

const Lab = require('lab');
const Code = require('code');

const ProductSizeService = require('../../../server/plugins/products/product-sizes.service');

const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;
const before = lab.before;
const expect = Code.expect;



// describe("Testing app-product-sizes.service", function() {
//
//     it("getSizeTypes() return an object", function (done) {
//         var types = ProductSizeService.getSizeTypes();
//
//         expect( types ).to.be.an.object();
//         expect( types ).to.include(
//             [
//                 'youth_xs',
//                 'youth_s',
//                 'youth_m',
//                 'youth_l',
//                 'youth_xl',
//                 'adult_xs',
//                 'adult_s',
//                 'adult_m',
//                 'adult_l',
//                 'adult_xl',
//                 'adult_2xl',
//                 'adult_3xl',
//                 'adult_4xl'
//             ]
//         );
//
//         done();
//     });
//
// });