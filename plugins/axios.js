'use strict';

var os = require("os");
var hostname = os.hostname();

export default function ({ $axios }) {
    // $axios.defaults.baseURL = `http://${process.env.API_HOST}:${process.env.API_PORT}/api/v1`;
    console.log("AXIOS PLUGIN", $axios);
    // console.log("AXIOS PLUGIN API_HOST", process.env.API_HOST);
    console.log("AXIOS PLUGIN - HOST NAME", hostname)
}
