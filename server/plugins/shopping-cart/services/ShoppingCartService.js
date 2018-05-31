'use strict';

const Joi = require('joi');
const jwt = require('jsonwebtoken');
const uuidV4 = require('uuid/v4');
const BaseService = require('../../core/services/BaseService');
const helperService = require('../../../helpers.service');

module.exports = class ShoppingCartService extends BaseService {

    constructor(server) {
        super(server, 'ShoppingCart')
    }


    getShippingAttributesSchema() {
        return {
            shipping_firstName: Joi.string().trim().max(255).required(),
            shipping_lastName: Joi.string().trim().max(255).required(),
            shipping_company: Joi.string().trim().max(255).empty(null),
            shipping_streetAddress: Joi.string().trim().max(255).required(),
            shipping_extendedAddress: Joi.string().trim().max(255).empty(null),
            shipping_city: Joi.string().trim().max(255).required(),
            shipping_state: Joi.string().trim().max(255).required(),
            shipping_postalCode: Joi.string().trim().max(10).required(),
            shipping_countryCodeAlpha2: Joi.string().trim().max(2).required(),  // alpha2 is required by PayPal:  https://developers.braintreepayments.com/reference/request/transaction/sale/node#billing.country_code_alpha2
            shipping_email: Joi.string().email().max(50).label('Shipping: Email').required()
        }
    }


    getBillingAttributesSchema() {
        return {
            billing_firstName: Joi.string().trim().max(255),
            billing_lastName: Joi.string().trim().max(255),
            billing_company: Joi.string().trim().max(255).empty(null),
            billing_streetAddress: Joi.string().trim().max(255),
            billing_extendedAddress: Joi.string().trim().max(255).empty(null),
            billing_city: Joi.string().trim().max(255),
            billing_state: Joi.string().trim().max(255),
            billing_postalCode: Joi.string().trim().max(10),
            billing_countryCodeAlpha2: Joi.string().trim().max(2),
            billing_phone: Joi.string().trim().max(30).empty(null)
        }
    }


    getDefaultWithRelated() {
        const defaultWithRelated = [
            {
                cart_items: (query) => {
                    // NOTE: the problem with sorting by 'updated at' is
                    // when updating the qty of an item in the UI, the cart item
                    // the user is updating will unexpectedly jump to the top of the list
                    // because it is the last updated item
                    query.orderBy('created_at', 'DESC');
                }
            },
            {
                'cart_items.product.pics': (query) => {    // https://stackoverflow.com/questions/35679855/always-fetch-from-related-models-in-bookshelf-js#35841710
                    query.where('is_visible', '=', true);
                    query.orderBy('sort_order', 'ASC');

                    // Somehow this is resulting in no pics being returned sometimes.
                    // Commenting out for now
                    // query.limit(1);
                }
            }
        ];

        return defaultWithRelated;
    }


    /**
     * Joi definitions for the ShoppingCart model
     *
     * NOTE:
     * The 'max' values are based on what is accepted by Braintree:
     * https://developers.braintreepayments.com/reference/request/transaction/sale/node
     */
    getShoppingCartModelSchema() {
        return Joi.object().keys({
            token: Joi.string().trim().max(100).required(),
            billing: Joi.object().keys(this.getBillingAttributesSchema()),
            shipping: Joi.object().keys(this.getShippingAttributesSchema()),
            shipping_rate: Joi.object().unknown()
        });
    }


    getCartTokenFromJwt(request) {
        const req = request.raw.req;

        if(request.auth.cookieToken) {
            let decoded = jwt.verify(request.auth.cookieToken , process.env.JWT_SERVER_SECRET);
            return decoded.ct;
        }

        return null;
    }


    getCart(request, withRelatedArr) {
        let self = this;

        return self.getModel().query((qb) => {
            qb.where('token', '=', self.getCartTokenFromJwt(request));
            qb.whereNull('closed_at');
            qb.whereNull('status');
        })
        .orderBy('created_at', 'DESC')
        .fetch({
            withRelated: Array.isArray(withRelatedArr) ? withRelatedArr : this.getDefaultWithRelated()
        })
    }


    /**
     * Finds the cart using the cart token from JWT,
     * or creates one if it doesn't exist
     *
     * @param request
     * @returns {Promise}
     */
    findOrCreateCart(request) {
        let self = this;

        // If the shipping rate is a flat cost then adding it to the model now
        // so it will be readily available at checkout.  If we ever decide to
        // provide multiple shipping options in the future then this value can
        // be overridden by whatever option the user chooses at checkout.
        return self.getCart(request)
            .then((ShoppingCart) => {
                return ShoppingCart || self.getModel().create({
                    token: self.getCartTokenFromJwt(request)
                });
            })
    }
}
