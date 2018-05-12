'use strict';

const Promise = require('bluebird');
const path = require('path');
const Config = require('../../../config');
const mailgun = require('mailgun-js')({apiKey: Config.get('/mailgun/apiKey'), domain: Config.get('/mailgun/domain')});
const mailcomposer = require('mailcomposer');
const pug = require('pug');
const isObject = require('lodash.isobject');


module.exports = class ShoppingCartEmailService {

    send(config) {
        return new Promise((resolve, reject) => {
            let mail = mailcomposer({
                from: `${process.env.EMAIL_FROM_CART_SUCCESS_NAME || 'gmnst.com'} <${process.env.EMAIL_FROM_CART_SUCCESS || 'thanks@gmnst.com'}>`,
                to: config.to,
                subject: config.subject,
                body: config.text,
                html: config.html
            });
    
            mail.build((mailBuildError, message) => {
                mailgun
                    .messages()
                    .sendMime({
                        to: config.to,
                        message: message.toString('ascii')
                    }, (sendError, body) => {
                        if(sendError) {
                            reject(sendError);
                        }
                        else {
                            resolve(body);
                        }
                    });
            });
        });
    };


    getPurchaseDescription(ShoppingCart) {
        let cart = ShoppingCart.toJSON();
        let totalNumItems = cart.num_items;
        let cart_items = cart.cart_items;
        let firstItem = null;
        let remainingItems = 0;
    
        if(Array.isArray(cart_items)) {
            if(isObject(cart_items[0]) && isObject(cart_items[0].product) && cart_items[0].product.hasOwnProperty('title')) {
                firstItem = this.substringOnWords(cart_items[0].product.title);
                remainingItems = totalNumItems - 1;
    
                if(!remainingItems) {
                    return `"${firstItem}"`;
                }
            }
    
            let itemText = remainingItems === 1 ? 'item' : 'items';
            return `"${firstItem}" and ${remainingItems} more ${itemText}`;
        }
    
        return null;
    }


    getShippingName(ShoppingCart) {
        let cart = ShoppingCart.toJSON();
        let val = [];
        
        if(cart.shipping_firstName) {
            val.push(cart.shipping_firstName);
        }
    
        if(cart.shipping_lastName) {
            val.push(cart.shipping_lastName);
        }
    
        return val.join(' ');
    }


    /**
     * Creates a substring but does not break up words
     * 
     * @param str The string to trim
     * @param maxLen The maximum length to trim the string to
     * @param suffix The suffix to append to the end of the string if it is trimmed.  Pass null to append nothing.
     */
    substringOnWords(str, maxLen, suffix) {
        let cleanStr = str.trim();
        let end = (suffix === undefined ? '...' : '');
        let max = parseInt(maxLen, 10) || 25;
        let arr = cleanStr.length ? cleanStr.split(' ') : [];
        let words = [];
        let finalCount = 0;
        let forEachDone = false;

        arr.forEach((part, index) => {
            if(!forEachDone) {
                let pl = part.length;
                let lengthIncludingSpaces = index > 0 ? pl + 1 : pl;

                if(finalCount + lengthIncludingSpaces <= max) {
                    words.push(part);
                    finalCount += lengthIncludingSpaces;
                }
                else {
                    forEachDone = true;
                }
            }
        });

        // If there is nothing in 'words' then the original string 'cleanStr'
        // had no spaces in it, so we'll just return the truncated 'cleanStr'
        if(!words.length) {
            return cleanStr.length > max ? cleanStr.substring(0, max) + end : cleanStr;
        }

        let done = words.join(' ');
        return (cleanStr.length > done.length ? done + end : done);
    }


    emailPurchaseReceiptToBuyer(ShoppingCart, transactionId, orderTitle) {
        let self = this;

        return new Promise((resolve, reject) => {
            let html = pug.renderFile(
                path.join(__dirname, '../email-templates', 'purchase-receipt.pug'), 
                {
                    orderTitle,
                    transactionId,
                    shipping: {
                        name: self.getShippingName(ShoppingCart),
                        address: ShoppingCart.get('shipping_streetAddress')
                    },
                    sub_total: ShoppingCart.get('sub_total'),
                    shipping_total: ShoppingCart.get('shipping_total'),
                    sales_tax: ShoppingCart.get('sales_tax'),
                    grand_total: ShoppingCart.get('grand_total')
                }
            );
    
            self.send({
                to: ShoppingCart.get('shipping_email'),
                subject: `Your gmnst.com order of ${orderTitle}`,
                // text: 'sample text for purchase receipt', //TODO:
                html: html
            });
        })
    }


    emailPurchaseAlertToAdmin(ShoppingCart, transactionId, orderTitle) {
        let self = this;

        return new Promise((resolve, reject) => {
            let html = pug.renderFile(
                path.join(__dirname, '../email-templates', 'admin-purchase-alert.pug'), 
                {
                    orderTitle,
                    transactionId,
                    shipping_firstName: ShoppingCart.get('shipping_firstName'),
                    shipping_lastName: ShoppingCart.get('shipping_lastName'),
                    shipping_streetAddress: ShoppingCart.get('shipping_streetAddress'),
                    shipping_extendedAddress: ShoppingCart.get('shipping_extendedAddress'),
                    shipping_company: ShoppingCart.get('shipping_company'),
                    shipping_city: ShoppingCart.get('shipping_city'),
                    shipping_state: ShoppingCart.get('shipping_state'),
                    shipping_postalCode: ShoppingCart.get('shipping_postalCode'),
                    shipping_countryCodeAlpha2: ShoppingCart.get('shipping_countryCodeAlpha2'),
                    shipping_email: ShoppingCart.get('shipping_email'),
                    sub_total: ShoppingCart.get('sub_total'),
                    shipping_total: ShoppingCart.get('shipping_total'),
                    sales_tax: ShoppingCart.get('sales_tax'),
                    grand_total: ShoppingCart.get('grand_total')
                }
            );
    
            self.send({
                to: process.env.ADMIN_EMAIL,
                subject: `NEW ORDER: ${orderTitle}`,
                html: html
            });
        })
    }


    sendPurchaseEmails(ShoppingCart, transactionId) {
        let orderTitle = this.getPurchaseDescription(ShoppingCart);
    
        return Promise.all([
            this.emailPurchaseReceiptToBuyer(ShoppingCart, transactionId, orderTitle),
            this.emailPurchaseAlertToAdmin(ShoppingCart, transactionId, orderTitle)
        ]);
    }

}