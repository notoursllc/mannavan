'use strict';

const Boom = require('boom');
const isObject = require('lodash.isobject');
const { getAxios } = require('./helpers')

const $axios = getAxios();


/**
 * API REFERENCE: https://goshippo.com/docs/reference/js#orders-create
 * DOCS: https://goshippo.com/docs/orders/#create-order
 */
async function listAllOrders() {
    try {
        const { data } = await $axios.get('/orders');
        return data.results || [];
    }
    catch(error) {
        global.logger.error(error);
        global.bugsnag(error);
        throw Boom.badRequest(error);
    }
}


/**
 * API REFERENCE: https://goshippo.com/docs/reference/bash#orders-retrieve
 * DOCS: https://goshippo.com/docs/orders/#retrieve-order
 */
async function getOrder(orderObjectId) {
    try {
        const { data } = await $axios.get(`/orders/${orderObjectId}/`);
        return data;
    }
    catch(error) {
        global.logger.error(error);
        global.bugsnag(error);
        throw Boom.badRequest(error);
    }
}


/**
 * API REFERENCE: https://goshippo.com/docs/reference/bash#orders-create
 * DOCS: https://goshippo.com/docs/orders/#retrieve-order
 */
async function createOrder(data) {
    const d = isObject(data) ? data : {};

    try {
        const { data } = await $axios.post('/orders', d);
        return data;
    }
    catch(error) {
        global.logger.error(error);
        global.bugsnag(error);
        throw Boom.badRequest(error);
    }
}


module.exports = {
    listAllOrders,
    getOrder,
    createOrder
}
