'use strict';

const BaseService = require('../../core/services/BaseService');


module.exports = class CustomerService extends BaseService {

    constructor(server) {
        super(server, 'Customer')
    }

}