'use strict';

const Lab = require('lab');
const Code = require('code');

const ProductCategoryService = require('../../../server/plugins/products/product-categories.service');

const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;
const before = lab.before;
const expect = Code.expect;


// describe("Testing app-product-categories.service", function() {
//
//     it("getCategoryTypes() return an object", function (done) {
//         var types = ProductCategoryService.getCategoryTypes();
//
//         expect( types ).to.be.an.object();
//         expect( types ).to.include( ['apparel'] );
//
//         done();
//     });
//
// });