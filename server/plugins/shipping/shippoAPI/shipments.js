'use strict';

const { getList, getSingle, postCreate } = require('./helpers')
const basePath = '/shipments';



 /**
 * The heart of the Shippo API, a shipment is made up of "to" and "from" addresses
 * and the parcel to be shipped. Once created, a shipment object can be used to
 * retrieve shipping rates and purchase a shipping label.
 *
 * The purpose of the Shipment object is to retrieve rates. It represents a request to
 * ship a given package between the sender and recipient addresses. You could create the
 * Address and Parcel objects in separate API calls but we suggest creating the Address and Parcel
 * objects inline as it will save you time and extra network calls.
 *
 * https://goshippo.com/docs/reference/js#shipments-create
 *
 * @param {*} data
 */
async function createShipment(data) {
    return await postCreate(basePath, data);
}


/**
 * API REFERENCE: https://goshippo.com/docs/reference/js#shipments-list
 */
async function listShipments() {
    return await getList(basePath)
}


/**
 * API REFERENCE: https://goshippo.com/docs/reference/js#shipments-retrieve
 *
 * @param {*} id
 */
async function getShipment(shipmentObjectId) {
    return await getSingle(`${basePath}/${shipmentObjectId}`)
}


module.exports = {
    createShipment,
    listShipments,
    getShipment
}



