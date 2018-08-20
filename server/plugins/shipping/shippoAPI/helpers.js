'use strict';

const Boom = require('boom');
const axios = require('axios');
const isObject = require('lodash.isobject');


function getAxios() {
    if(!getAxios.$axios) {
        getAxios.$axios = axios.create({
            baseURL: 'https://api.goshippo.com',
            timeout: 10000,
            headers: {
                'Authorization':  `ShippoToken ${process.env.SHIPPO_API_KEY_TEST}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'User-Agent': 'Shippo/v1 NodeBindings'
                // 'Shippo-API-Version': '2018-02-08'
            }
        });
    }

    return getAxios.$axios;
}


async function getList(path) {
    try {
        const { data } = await getAxios().get(path);
        return data.results || [];
    }
    catch(err) {
        global.logger.error(error);
        global.bugsnag(error);
        throw Boom.badRequest(error);
    }
}


async function getSingle(path) {
    try {
        const { data } = await getAxios().get(path);
        return data;
    }
    catch(error) {
        global.logger.error(error);
        global.bugsnag(error);
        throw Boom.badRequest(error);
    }
}


async function postCreate(path, obj) {
    const d = isObject(obj) ? obj : {};

    try {
        const { data } = await getAxios().post(path, d);
        return data;
    }
    catch(error) {
        global.logger.error(error);
        global.bugsnag(error);
        throw Boom.badRequest(error);
    }
}


module.exports = {
    getAxios,
    getList,
    getSingle,
    postCreate
}
