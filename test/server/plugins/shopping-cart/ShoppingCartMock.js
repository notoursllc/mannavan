const forEach = require('lodash.foreach');
const isObject = require('lodash.isobject');

module.exports = class ShoppingCart {
    constructor(data) {
        if(isObject(data)) {
            forEach(data, (val, key) => {
                this[key] = val;
            })
        }
    }

    get(key) {
        return this[key];
    }

    set(key, value) {
        return this[key] = value;
    }
}
