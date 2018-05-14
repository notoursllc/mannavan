'use strict';

const Lab = require('lab');
const Code = require('code');
const util = require('util');
const _ = require('lodash');

// const ShoppingCartService = require('../../../server/plugins/shopping-cart/shopping-cart.service');

const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;
const expect = Code.expect;



// describe('ShoppingCartService testing', () => {
//
//     describe("ShoppingCartService.decorateProduct()", function() {
//
//         var product = {
//             __selectedOptions: { size: 3 },
//             id: 2
//         };
//
//         it("Should return a Promise", function (done) {
//             let options = {
//                 method: 'GET',
//                 url: '/api/v1/cart/get'
//             };
//
//             server.inject(options, (response) => {
//                 expect(response.statusCode).to.equal(200);
//                 var promise = ShoppingCartService.decorateProduct(product, response.request);
//                 expect(promise).to.be.an.object();
//                 done();
//             });
//         });
//
//         it("Should resolve with a decorated product object", function (done) {
//             let options = {
//                 method: 'GET',
//                 url: '/api/v1/cart/get'
//             };
//
//             server.inject(options, (response) => {
//                 var promise = ShoppingCartService.decorateProduct(product, response.request);
//
//                 promise
//                     .then((decoratedProduct) => {
//                         expect(testHelpers.isDecoratedProduct(decoratedProduct));
//                         expect(decoratedProduct.product.hasOwnProperty('__selectedOptions'));
//                         expect(decoratedProduct.product.__selectedOptions.size).to.equal(product.__selectedOptions.size);
//                         done();
//                     })
//                     .catch((err) => {
//                         console.log('ERR', err);
//                         done();
//                     });
//             });
//         });
//
//         it("Should fail when invalid product ID is passed", function (done) {
//             let prod = {
//                 __selectedOptions: { size: 3 },
//                 id: 'abc'
//             };
//
//             let options = {
//                 method: 'GET',
//                 url: '/api/v1/cart/get'
//             };
//
//             server.inject(options, (response) => {
//                 var promise = ShoppingCartService.decorateProduct(prod, response.request);
//
//                 promise
//                     .then((decoratedProduct) => {
//                         // console.log('DECORATED!', decoratedProduct);
//                         expect( decoratedProduct ).to.be.null();
//                         done();
//                     })
//                     .catch((err) => {
//                         // console.log('ERR!!', err);
//                         expect( testHelpers.isJoiValidationError(err) ).to.be.true();
//                         done();
//                     });
//             });
//         });
//     });
//
//
//     describe('ShoppingCartService.internals.cartItemExists', function() {
//         it('Should return true when cart_data contains a given product', function(done) {
//             var product = {
//                 id: 123,
//                 __selectedOptions: { size: 3 }
//             };
//
//             var cart_data = [{
//                 product: _.clone(product)
//             }];
//
//             expect( ShoppingCartService.internals.cartItemExists(cart_data, product) ).not.to.be.null();
//             done();
//         });
//
//         it('Should return null when cart_data does not contain a given product', function(done) {
//             var product = {
//                 id: 123,
//                 __selectedOptions: { size: 3 }
//             };
//
//             var cart_data = [{
//                 product: {
//                     id: 456
//                 }
//             }];
//
//             expect( ShoppingCartService.internals.cartItemExists(cart_data, product) ).to.be.null();
//             done();
//         });
//     });
//
//
//     describe('ShoppingCartService.findOrCreateSessionCart', function() {
//         let options = {
//             method: 'GET',
//             url: '/api/v1/cart/get'
//         };
//
//         it("Should return a Promise", function (done) {
//             server.inject(options, (response) => {
//                 var promise = ShoppingCartService.findOrCreateSessionCart(response.request);
//                 expect( testHelpers.isPromise(promise) ).to.be.true();
//                 done();
//             });
//         });
//
//         // it("request should return an error if the request does not contain a yar object", function (done) {
//         //     server.inject(options, (response) => {
//         //         ShoppingCartService
//         //             .findOrCreateSessionCart(response.request)
//         //             .then((shoppingCartJson) => {
//         //                 expect( shoppingCartJson ).to.be.null();
//         //                 done();
//         //             })
//         //             .catch((err) => {
//         //                 expect( testHelpers.isJoiValidationError(err) ).to.be.true();
//         //                 done();
//         //             });
//         //     });
//         // });
//
//         it("Should resolve with a ShoppingCart object", function (done) {
//             server.inject(options, (response) => {
//                 ShoppingCartService
//                     .findOrCreateSessionCart(response.request)
//                     .then(
//                         function(ShoppingCart) {
//                             expect( testHelpers.isShoppingCartModel(ShoppingCart) ).to.be.true();
//                             done();
//                         },
//                         function(err) {
//                             expect( err ).to.be.null();
//                             done();
//                         }
//                     );
//             });
//         });
//     });
//
//
//     describe('ShoppingCartService.getCartItemPrice', function() {
//         it("Should return the sale price if it's on sale and the sale price is set", function (done) {
//             var cartItem = {};
//             cartItem.product = {};
//             cartItem.product.is_on_sale = true;
//             cartItem.product.sale_price = 111.11;
//             cartItem.product.base_price = 222.22;
//
//             expect( ShoppingCartService.getCartItemPrice(cartItem) ).to.equal(cartItem.product.sale_price);
//             done();
//         });
//
//         it("Should return the base price if it's on sale but the sale price is not set", function (done) {
//             var cartItem = {};
//             cartItem.product = {};
//             cartItem.product.is_on_sale = true;
//             cartItem.product.base_price = 222.22;
//
//             expect( ShoppingCartService.getCartItemPrice(cartItem) ).to.equal(cartItem.product.base_price);
//             done();
//         });
//
//         it("Should return the base price if it's not on sale", function (done) {
//             var cartItem = {};
//             cartItem.product = {};
//             cartItem.product.is_on_sale = false;
//             cartItem.product.sale_price = 111.11;
//             cartItem.product.base_price = 222.22;
//
//             expect( ShoppingCartService.getCartItemPrice(cartItem) ).to.equal(cartItem.product.base_price);
//             done();
//         });
//
//         it("Should return zero if not passed an object", function (done) {
//             expect( ShoppingCartService.getCartItemPrice(null) ).to.equal(0);
//             expect( ShoppingCartService.getCartItemPrice({}) ).to.equal(0);
//             done();
//         });
//     });
//
//
//     describe('ShoppingCartService.internals.getCartItemTotalPrice', function() {
//         it('Should return 0.00 if passed null or an empty object', function(done) {
//             expect( ShoppingCartService.internals.getCartItemTotalPrice(null) ).to.equal(0);
//             expect( ShoppingCartService.internals.getCartItemTotalPrice({}) ).to.equal(0);
//             expect( ShoppingCartService.internals.getCartItemTotalPrice(['foo']) ).to.equal(0);
//             done();
//         });
//
//         it('Should return the correct price for the given quantity', function(done) {
//             expect(
//                 ShoppingCartService.internals.getCartItemTotalPrice({
//                     qty: 1,
//                     product: {
//                         base_price: 111.11
//                     }
//                 })
//             ).to.equal(111.11);
//
//             expect(
//                 ShoppingCartService.internals.getCartItemTotalPrice({
//                     qty: 3,
//                     product: {
//                         base_price: 111.11
//                     }
//                 })
//             ).to.equal(333.33);
//
//             expect(
//                 ShoppingCartService.internals.getCartItemTotalPrice({
//                     qty: 0,
//                     product: {
//                         base_price: 111.11
//                     }
//                 })
//             ).to.equal(0);
//
//             done();
//         });
//
//         it('Should return the base price when qty is not a number', function(done) {
//             expect(
//                 ShoppingCartService.internals.getCartItemTotalPrice({
//                     qty: 'abc',
//                     product: {
//                         base_price: 111.11
//                     }
//                 })
//             ).to.equal(111.11);
//
//             done();
//         });
//
//         it('Should return 0 then there is no base price', function(done) {
//             expect(
//                 ShoppingCartService.internals.getCartItemTotalPrice({
//                     qty: 'abc',
//                     product: {}
//                 })
//             ).to.equal(0);
//
//             done();
//         });
//     });
//
//
//     describe('ShoppingCartService.getCartSubTotal', function() {
//         it('Should return 0 if not passed a an array of cart items', function(done) {
//             expect( ShoppingCartService.getCartSubTotal() ).to.equal(0);
//             expect( ShoppingCartService.getCartSubTotal([]) ).to.equal(0);
//             expect( ShoppingCartService.getCartSubTotal({}) ).to.equal(0);
//             expect( ShoppingCartService.getCartSubTotal('abc') ).to.equal(0);
//             done();
//         });
//
//         it('Should calculate the total correctly for set of cart items', function(done) {
//             var cartData = [
//                 {
//                     qty: 0,
//                     product: {
//                         is_on_sale: false,
//                         sale_price: 1.11,
//                         base_price: 2.22,   // 0 x 2.22 = 0
//                         someIrrelivantAttribute: 'foo'
//                     },
//                     anotherIrrelivantAttribute: 'bar'
//                 },
//                 {
//                     qty: 1,
//                     product: {
//                         is_on_sale: false,
//                         sale_price: 1.11,
//                         base_price: 2.22  // 1 x 2.22 = 2.22
//                     }
//                 },
//                 {
//                     qty: 2,
//                     product: {
//                         is_on_sale: true,
//                         sale_price: 1.11,  // 2 x 1.11 = 2.22
//                         base_price: 2.22
//                     }
//                 },
//                 {
//                     qty: 4,
//                     product: {
//                         is_on_sale: false,
//                         sale_price: 1.11,
//                         base_price: 2.22  // 3 x 2.22 = 8.88
//                     }
//                 }
//             ];
//
//             expect( ShoppingCartService.getCartSubTotal(cartData) ).to.equal(13.32);
//             done();
//        });
//     });
//
//
//     describe('ShoppingCartService.getNumItemsInCart', function() {
//         it('Should return 0 if not passed a an array of cart items', function(done) {
//             expect( ShoppingCartService.getNumItemsInCart() ).to.equal(0);
//             expect( ShoppingCartService.getNumItemsInCart([]) ).to.equal(0);
//             expect( ShoppingCartService.getNumItemsInCart({}) ).to.equal(0);
//             expect( ShoppingCartService.getNumItemsInCart('abc') ).to.equal(0);
//             expect( ShoppingCartService.getNumItemsInCart( [{ qty: 'abc' }]) ).to.equal(0);
//             done();
//         });
//
//         it('Should calculate the number of items correctly for set of cart items', function(done) {
//             var cartData = [
//                 {
//                     qty: 0,
//                     product: {
//                         someIrrelivantAttribute: 'foo'
//                     },
//                     anotherIrrelivantAttribute: 'bar'
//                 },
//                 {
//                     qty: 1
//                 },
//                 {
//                     qty: 2,
//                     product: {}
//                 },
//                 {
//                     qty: 4,
//                     product: {}
//                 }
//             ];
//
//             expect( ShoppingCartService.getNumItemsInCart(cartData) ).to.equal(7);
//             done();
//         });
//     });


// describe('ShoppingCartService.internals.addDecoratedProductToCart', function() {
//     var req = {};
//     req.method = 'POST';
//     req.url = '/2';
//     req.payload = {
//         product: {
//             __selectedOptions: { size: 3 },
//             id: 2
//         }
//     };
//
//     var promise;
//
//     it("Should return a Promise", function (done) {
//         server.inject(req, function (response) {
//             ShoppingCartService.internals
//                 .decorateProduct(req.payload.product, response.request)
//                 .then(
//                     function(decoratedProd) {
//                         return ShoppingCartService.internals.addDecoratedProductToCart(decoratedProd)
//                     }
//                 )
//                 .then(
//                     function() {
//                         //TODO
//                     }
//                 )
//             expect(promise).to.be.an.object();
//             done();
//         });
//     });
// });
// });