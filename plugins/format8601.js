'use strict';

import Vue from 'vue';

/**
 * Return a timestamp with the format "m/d/yy h:MM:ss TT"
 * @type {Date}
 */
export function formatDate(iso) {
    let d = new Date(iso);

    let date = [ d.getMonth() + 1, d.getDate(), d.getFullYear() ];
    let time = [ d.getHours(), d.getMinutes() ];
    let suffix = (time[0] < 12) ? 'AM' : 'PM';

    // Convert hour from military time
    time[0] = (time[0] < 12) ? time[0] : time[0] - 12;

    // If hour is 0, set it to 12
    time[0] = time[0] || 12;

    // If seconds and minutes are less than 10, add a zero
    for (var i=1; i<3; i++) {
        if (time[i] < 10) {
            time[i] = '0' + time[i];
        }
    }

    return `${date.join('/')} ${time.join(':')} ${suffix}`;
}

const format8601 = value => {
    return formatDate(value);
};

Vue.filter('format8601', format8601);
