'use strict';

import Vue from 'vue';

export function formatJson(value) {
    let parsed = value && typeof value === 'string' ? JSON.parse(value) : value;
    // return JSON.stringify(JSON.parse(value), null, 2);
    return JSON.stringify(parsed, null, 2);
}

const pretty = value => {
    return formatJson(value)
};

Vue.filter('formatJson', pretty);
