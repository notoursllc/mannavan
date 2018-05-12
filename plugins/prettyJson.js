'use strict';

import Vue from 'vue';

export function formatJson(value) {
    return JSON.stringify(JSON.parse(value), null, 2);
}

const pretty = value => {
    return formatJson(value)
};

Vue.filter('formatJson', pretty);
