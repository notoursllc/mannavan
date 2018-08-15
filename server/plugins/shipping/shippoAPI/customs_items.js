'use strict';

const { getList, getSingle, postCreate } = require('./helpers')
const basePath = '/customs/items';



async function createCustomsItem(data) {
    return await postCreate(basePath, data);
}


/**
 * Retrieve a customs item object.
 *
 * API REFERENCE: https://goshippo.com/docs/reference/bash#customs-items-retrieve
 */
async function getCustomsItem(customsItemObjectId) {
    return await getSingle(`${basePath}/${customsItemObjectId}`)
}


/**
 * Retrieve the entire list of customs item objects.
 *
 * API REFERENCE: https://goshippo.com/docs/reference/bash#customs-items-list
 */
async function listCustomsItems() {
    return await getList(basePath)
}


module.exports = {
    createCustomsItem,
    getCustomsItem,
    listCustomsItems
}
