'use strict';

const Joi = require('joi');
const Promise = require('bluebird');
const isObject = require('lodash.isobject');
const BaseService = require('../../core/services/BaseService');


module.exports = class PaymentService extends BaseService {

    constructor(server) {
        super(server, 'Payment')
    }


    /**
     * From Braintree docs:
     * "A client token is a signed data blob that includes configuration and authorization information
     * required by the Braintree Client SDK. These should not be reused; a new client token should be
     * generated for each customer request that's sent to Braintree.
     * For security, we will revoke client tokens if they are reused excessively within a short time period."
     *
     * https://developers.braintreepayments.com/start/overview
     * https://developers.braintreepayments.com/reference/request/client-token/generate/node
     *
     * @returns {Promise}
     */
    getClientToken() {
        return new Promise((resolve, reject) => {
            global.braintreeGateway.clientToken.generate({}, (err, response) => {
                if(err || !response.clientToken) {
                    return reject(err);
                }

                return resolve(response.clientToken);
            });
        });
    }


    /**
     * Persists some of the Braintree transaction data
     *
     * Since the Braintree API allows searching for transaction data (https://developers.braintreepayments.com/reference/general/searching/search-fields/node)
     * it seems redundant and perhaps a bit insecure to store the entire transaction JSON here as well.
     * Therefore, pulling out only a few relevant transaction attributes (most importantly the transaction id)
     * and persisting those only.
     *
     * @param cart_id
     * @param transactionJson
     * @returns {Promise}
     */
    savePayment(cart_id, transactionJson) {
        let self = this;
        
        return new Promise((resolve, reject) => {
            if(!isObject(transactionJson) || !isObject(transactionJson.transaction)) {
                let msg = 'An error occurred while processing the transaction: transactionJson.transaction is not an object';
                global.logger.error(msg);
                global.bugsnag(msg);
                return reject('An error occurred while processing the transaction.');
            }

            self.getModel()
                .forge()
                .save({
                    cart_id: cart_id,
                    transaction_id: transactionJson.transaction.id,  
                    transaction: transactionJson.transaction,
                    success: transactionJson.success || null
                }, {method: 'insert'})
                .then((Payment) => {
                    resolve(Payment.toJSON());
                })
                .catch((err) => {
                    global.logger.error(err);
                    global.bugsnag(err);
                    reject(err);
                });
        });
    }


    /**
     * Submits a payment 'sale' to Braintree
     *
     * @param opts  Options object to pass to braintree.transaction.sale
     * @returns {Promise}
     */
    runPayment(opts) {
        return new Promise((resolve, reject) => {
            let schema = Joi.object().keys({
                paymentMethodNonce: Joi.string().trim().required(),
                amount: Joi.number().precision(2).positive().required(),
                shipping: Joi.object().unknown().required(),
                customer: Joi.object().unknown(),
                billing: Joi.object().unknown(),
                options: Joi.object().unknown()
            });

            const validateResult = schema.validate(opts);
            if (validateResult.error) {
                return reject(validateResult.error);
            }

            global.braintreeGateway.transaction.sale(opts)
                .then((result) => {
                    if (result.success) {
                        return resolve(result);
                    }

                    throw new Error(result.message);
                })
                .catch((err) => {
                    // NOTE: this error will be logged by the calling function
                    let msg = err instanceof Error ? err.message : err;
                    return reject(msg);
                });
        });
    }


    /**
     * Gets a payment by a given attribute
     *
     * @param attrName
     * @param attrValue
     * @returns {Promise}
     */
    getPaymentByAttribute(attrName, attrValue) {
        return this
            .getModel()
            .query((qb) => {
                qb.where(attrName, '=', attrValue);  // TODO: Is there a SQL injection risk here?
            })
            .fetch({
                withRelated: [
                    'shoppingCart.cart_items.product' // https://stackoverflow.com/questions/35679855/always-fetch-from-related-models-in-bookshelf-js#35841710
                ]
            })
    }
}