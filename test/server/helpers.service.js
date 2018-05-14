'use strict';

const Lab = require('lab');
const Code = require('code');
// const Inert = require('inert');

// const CoreService = require('./CoreService');

const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;
const before = lab.before;
const expect = Code.expect;


// lab.before( function(done) {
//
//
// });



// describe("Testing CoreService.makeArray()", function() {
//
//     it("Should return an array when given a string", function (done) {
//         var test = 'foo';
//
//         expect( CoreService.makeArray(test) ).to.be.an.array();
//         done();
//     });
//
//     it("Should return an array when given an array", function (done) {
//         var test = ['foo'];
//
//         expect( CoreService.makeArray(test) ).to.be.an.array();
//         done();
//     });
//
//     it("Should return an array when given an object", function (done) {
//         var test = {
//             foo: 1
//         };
//
//         expect( CoreService.makeArray(test) ).to.be.an.array();
//         done();
//     });
//
// });


// describe("Testing CoreService.getSearchParams()", function() {
//
//     it("Should return an object", function (done) {
//         expect( CoreService.getSearchParams() ).to.be.an.object();
//         done();
//     });
//
//     it("Should return an object with a 'where' member when the input contains a 'where' member", function (done) {
//         var test = {
//             where: {
//                 foo: 'bar'
//             },
//             something: {
//                 foo: 'bar'
//             }
//         };
//
//         expect( CoreService.getSearchParams(test) ).to.include('where');
//         expect( CoreService.getSearchParams(test) ).to.include('something');
//         expect( CoreService.getSearchParams(test) ).not.to.include('attributes');
//         done();
//     });
//
//     it("Should return an object with 'where' and 'attributes' values that are objects when their respective input is a valid JSON formatted string", function (done) {
//         var test = {
//             where: '{ "foo": "bar" }',
//             attributes: '{ "foo": "bar" }'
//         };
//
//         var obj = CoreService.getSearchParams(test);
//
//         expect( obj.where ).be.an.object();
//         expect( obj.attributes ).be.an.object();
//         done();
//     });
//
//     it("Should not return an object with 'where' or 'attributes' values if their respective input is an invalid JSON formatted string", function (done) {
//         var test = {
//             where: "{ 'foo': 'bar' }",
//             attributes: "{ 'foo': 'bar' }"
//         };
//
//         expect( CoreService.getSearchParams(test) ).not.to.include('where');
//         expect( CoreService.getSearchParams(test) ).not.to.include('attributes');
//         done();
//     });
//
// });


// describe("Testing CoreService.getAppInfo()", function() {

    //TODO: broken test
    // it("Should return a promise", function (done) {
    //     expect( CoreService.getAppInfo() ).to.be.an.object();
    //     done();
    // });

    // it("Should have a promise success that returns an object", function (done) {
    //     CoreService
    //         .getAppInfo()
    //         .then(
    //             function (info) {
    //                 console.log('info', info);
    //
    //                 expect( info ).to.be.an.object();
    //                 done();
    //             }
    //         );
    // });

    // it("Should have a promise success that returns an object with the appropriate members", function (done) {
    //     CoreService
    //         .getAppInfo()
    //         .then(
    //             function (info) {
    //                 expect( info.product ).to.be.an.object();
    //                 expect( info.product ).to.include([
    //                     'category',
    //                     'gender',
    //                     'size',
    //                     'type'
    //                 ]);
    //
    //                 expect( info.product.category ).to.be.an.object();
    //                 expect( info.product.category ).to.include([
    //                     'apparel'
    //                 ]);
    //
    //                 expect( info.product.gender ).to.be.an.object();
    //                 expect( info.product.gender ).to.include([
    //                     'male',
    //                     'female',
    //                     'any'
    //                 ]);
    //
    //                 expect( info.product.size ).to.be.an.object();
    //                 expect( info.product.size ).to.include([
    //                     'youth_xs',
    //                     'youth_s',
    //                     'youth_m',
    //                     'youth_l',
    //                     'youth_xl',
    //                     'adult_xs',
    //                     'adult_s',
    //                     'adult_m',
    //                     'adult_l',
    //                     'adult_xl',
    //                     'adult_2xl',
    //                     'adult_3xl',
    //                     'adult_4xl'
    //                 ]);
    //
    //                 expect( info.product.type ).to.be.an.object();
    //                 expect( info.product.type ).to.include([
    //                     'top',
    //                     'hat',
    //                     'short'
    //                 ]);
    //
    //                 expect( info.clientToken ).to.be.a.string();
    //                 done();
    //             }
    //         );
    // });

// });