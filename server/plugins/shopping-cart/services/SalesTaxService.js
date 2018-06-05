'use strict';

const accounting = require('accounting');


/**
 * Calculate the sales tax amount.
 * Pretty simple for now as we only have nexus in CA.
 *
 * https://blog.taxjar.com/sales-tax-and-shipping/
 */
function getSalesTaxAmount(params) {
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
    return accounting.toFixed(taxAmount, 2);
}


module.exports = {
    getSalesTaxAmount
}
