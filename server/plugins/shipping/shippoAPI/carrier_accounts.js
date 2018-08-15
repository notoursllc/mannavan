'use strict';

const { getList, getSingle } = require('./helpers')
const basePath = '/carrier_accounts';

/**
 * List all carrier accounts.
 *
 * API REFERENCE: https://goshippo.com/docs/reference/bash#carrier-accounts-list
 */
async function listCarrierAccounts() {
    return await getList(basePath)
}


/**
 * Retrieve an existing carrier account by object id.
 *
 * API REFERENCE: https://goshippo.com/docs/reference/bash#carrier-accounts-retrieve
 */
async function getCarrierAccount(carrierAccountObjectId) {
    return await getSingle(`${basePath}/${carrierAccountObjectId}`)
}


module.exports = {
    listCarrierAccounts,
    getCarrierAccount
}
