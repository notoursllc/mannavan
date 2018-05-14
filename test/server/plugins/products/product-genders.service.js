'use strict';

const Lab = require('lab');
const Code = require('code');

const ProductGenderService = require('../../../server/plugins/products/product-genders.service');

const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;
const before = lab.before;
const expect = Code.expect;


// describe("Testing app-product-genders.service", function() {
//
//     it("getGenderTypes() return an object", function (done) {
//         var types = ProductGenderService.getGenderTypes();
//
//         expect( types ).to.be.an.object();
//         expect( types ).to.include( ['male', 'female', 'any'] );
//
//         done();
//     });
//
// });