'use strict';

const { getList, getSingle, postCreate, getAxios } = require('./helpers')
const basePath = '/orders';

/**
 * API REFERENCE: https://goshippo.com/docs/reference/js#orders-create
 * DOCS: https://goshippo.com/docs/orders/#create-order
 */
async function listAllOrders() {
    return await getList(basePath)
}


/**
 * API REFERENCE: https://goshippo.com/docs/reference/bash#orders-retrieve
 * DOCS: https://goshippo.com/docs/orders/#retrieve-order
 */
async function getOrder(orderObjectId) {
    return await getSingle(`${basePath}/${orderObjectId}`)
}


/**
 * API REFERENCE: https://goshippo.com/docs/reference/bash#orders-create
 * DOCS: https://goshippo.com/docs/orders/#retrieve-order
 */
async function createOrder(data) {
    global.logger.debug("CREATING SHIPPO ORDER", data);
    return await postCreate(basePath, data)
}


async function getPackingSlipForOrder(orderObjectId) {
    const response = await getAxios().get(`${basePath}/${orderObjectId}/packingslip`);
    global.logger.debug(`PACKING SLIP FOR ORDER_ID ${orderObjectId}`, response.data)
    return response.data;
}


module.exports = {
    listAllOrders,
    getOrder,
    createOrder,
    getPackingSlipForOrder
}
