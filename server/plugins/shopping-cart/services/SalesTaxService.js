'use strict';

const Promise = require('bluebird');
const accounting = require('accounting');

module.exports = class SalesTaxService {

    /**
     * Calculate the sales tax amount.
     * 
     * Pretty simple for now as we only have nexus in CA.
     * Returning a promise is overkill for now, but expecting that
     * we will eventually need to call a 3rd party service in the future
     * in which case a promise will be needed. This way the consumer 
     * won't need to change how they consume the function.
     * 
     * https://blog.taxjar.com/sales-tax-and-shipping/
     */
    getSalesTaxAmount(params) {
        return new Promise((resolve, reject) => {
            let taxAmount = 0;

            if(params.shipping_countryCodeAlpha2 === 'US' && params.sub_total) {
                switch(params.shipping_state) {
                    case 'CA':
                        // NOTE: shipping is not taxable in CA
                        taxAmount = parseFloat(params.sub_total) * parseFloat(process.env.TAX_RATE_CALIFORNIA || '0.09');
                        break;

                    default:
                }
            }

            // accounting.toFixed returns a string, so converting to float:
            return resolve(accounting.toFixed(taxAmount, 2));
        });
    }
    
}