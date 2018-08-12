'use strict';

const axios = require('axios');


function getAxios() {
    if(!getAxios.$axios) {
        getAxios.$axios = axios.create({
            baseURL: 'https://api.goshippo.com',
            timeout: 1000,
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


module.exports = {
    getAxios
}
