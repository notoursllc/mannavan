// 'use strict';

// const queryString = require('query-string');
// const Promise = require('bluebird');
// const Lab = require('lab');
// const Code = require('code');
// const testHelpers = require('../../../testHelpers');
// const serverSetup = require('../../payments/_serverSetup');

// const lab = exports.lab = Lab.script();
// const describe = lab.experiment;
// const expect = Code.expect;
// const it = lab.test;


// function getOrderFromList(index, verbose) {
//     return new Promise((resolve, reject) => {
//         testHelpers
//             .startServerAndGetHeaders(serverSetup.manifest, serverSetup.composeOptions)
//             .then(({err, server, headers}) => {
//                 expect(err).not.to.exist();

//                 let paramString = queryString.stringify(
//                     {
//                         page: 1,
//                         limit: 5
//                     },
//                     { arrayFormat: 'bracket' }
//                 );

//                 server
//                     .inject({
//                         method: 'GET',
//                         url: `/orders?${paramString}`,
//                         headers
//                     })
//                     .then((res) => {
//                         let data = res.result.data.toJSON();

//                         expect(res.statusCode, 'Status code').to.equal(200);

//                         return server.inject({
//                             method: 'GET',
//                             url: `/order?transaction_id=${data[index || 0].transaction_id}&verbose=${verbose}`,
//                             headers
//                         })
//                     })
//                     .then((res) => {
//                         resolve({
//                             response: res,
//                             server: server
//                         });
//                     });
//             });
//     });
// }


// describe('Testing route: GET /order', () => {

//     it('should contain the correct attributes in the response', (done) => {
//         getOrderFromList(0, false)
//             .then((obj) => {
//                 let res = obj.response;
//                 let data = res.result.data;

//                 expect(res.statusCode, 'Status code').to.equal(200);
//                 expect(data.hasOwnProperty('shipping')).to.equal(true);
//                 expect(data.hasOwnProperty('transaction')).to.equal(true);
//                 expect(data.transaction.hasOwnProperty('id')).to.equal(true);
//                 expect(data.transaction.hasOwnProperty('amount')).to.equal(true);

//                 // the shoppingCart object should only contain one attribute
//                 // since we did not request 'verbose' mode:
//                 expect(data.hasOwnProperty('shoppingCart')).to.equal(true);
//                 expect(data.shoppingCart.hasOwnProperty('num_items')).to.equal(true);
//                 expect(data.shoppingCart.hasOwnProperty('id')).to.equal(false);
//                 expect(data.shoppingCart.hasOwnProperty('cart_items')).to.equal(false);

//                 // testing payment attributes
//                 expect(data.transaction.hasOwnProperty('payment')).to.equal(true);

//                 expect(
//                     data.transaction.payment.type === 'credit_card' || data.transaction.payment.type === 'paypal_account'
//                 ).to.equal(true);

//                 if(data.transaction.payment.type === 'credit_card') {
//                     expect(data.transaction.payment.hasOwnProperty('last4')).to.equal(true);
//                     expect(data.transaction.payment.hasOwnProperty('cardType')).to.equal(true);
//                 }

//                 if(data.transaction.payment.type === 'paypal_account') {
//                     expect(data.transaction.payment.hasOwnProperty('payerEmail')).to.equal(true);
//                 }

//                 testHelpers.destroyKnexAndStopServer(obj.server, done);
//             });
//     });


//     it('should return the whole ShoppingCart object if passing "verbose=true"', (done) => {
//         testHelpers
//             .startServerAndGetHeaders(serverSetup.manifest, serverSetup.composeOptions)
//             .then(({err, server, headers}) => {
//                 expect(err).not.to.exist();

//                 let paramString = queryString.stringify(
//                     {
//                         page: 1,
//                         limit: 5
//                     },
//                     { arrayFormat: 'bracket' }
//                 );

//                 server
//                     .inject({
//                         method: 'GET',
//                         url: `/orders?${paramString}`,
//                         headers
//                     })
//                     .then((res) => {
//                         let data = res.result.data.toJSON();

//                         expect(res.statusCode, 'Status code').to.equal(200);

//                         return server.inject({
//                             method: 'GET',
//                             url: `/order?transaction_id=${data[0].transaction_id}`,
//                             headers
//                         })
//                     })
//                     .then((res) => {
//                         let data = res.result.data;

//                         expect(res.statusCode, 'Status code').to.equal(200);
//                         expect(data.hasOwnProperty('shipping')).to.equal(true);
//                         expect(data.hasOwnProperty('transaction')).to.equal(true);
//                         expect(data.hasOwnProperty('shoppingCart')).to.equal(true);
//                         expect(data.transaction.hasOwnProperty('id')).to.equal(true);
//                         expect(data.transaction.hasOwnProperty('amount')).to.equal(true);

//                         expect(data.transaction.hasOwnProperty('payment')).to.equal(true);
//                         expect(
//                             data.transaction.payment.type === 'credit_card' || data.transaction.payment.type === 'paypal_account'
//                         ).to.equal(true);

//                         if(data.transaction.payment.type === 'credit_card') {
//                             expect(data.transaction.payment.hasOwnProperty('last4')).to.equal(true);
//                             expect(data.transaction.payment.hasOwnProperty('cardType')).to.equal(true);
//                         }

//                         if(data.transaction.payment.type === 'paypal_account') {
//                             expect(data.transaction.payment.hasOwnProperty('payerEmail')).to.equal(true);
//                         }

//                         testHelpers.destroyKnexAndStopServer(server, done);
//                     });
//             });
//     });

// });
