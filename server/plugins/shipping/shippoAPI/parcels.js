'use strict';

const { getList, getSingle, postCreate } = require('./helpers')
const basePath = '/parcels';


/**
 * API REFERENCE:  https://goshippo.com/docs/reference/js#parcels-create
 */
async function createParcel(data) {
    return await postCreate(basePath, data);
}


/**
 * API REFERENCE: https://goshippo.com/docs/reference/bash#parcels-retrieve
 *
 * @param {*} parcelObjectId
 */
async function getParcel(parcelObjectId) {
    return await getSingle(`${basePath}/${parcelObjectId}`)
}


/**
 * Retrieve the entire list of parcel objects.
 *
 * API REFERENCE: https://goshippo.com/docs/reference/bash#parcels-list
 */
async function listParcels() {
    return await getList(basePath)
}


module.exports = {
    createParcel,
    getParcel,
    listParcels
}
