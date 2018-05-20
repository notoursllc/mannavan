'use strict';

export default function ({ $axios }) {
    $axios.defaults.baseURL = `http://${process.env.API_HOST}:${process.env.API_PORT}/api/v1`;
    console.log("AXIOS PLUGIN", $axios.defaults.baseURL);
}
