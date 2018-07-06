'use strict';

module.exports = class ShoppingCart {
    constructor(data) {
        this.data = data || {};
    }

    get(key) {
        return this.data[key];
    }

    related(key) {
        return this.data[key];
    }

    set(key, value) {
        return this.data[key] = value;
    }

    toJSON() {
        return this.data;
    }
}
