'use strict';

const CoreService = require('../../core/core.service');

module.exports = function (baseModel, bookshelf) {
    return baseModel.extend(
        {
            tableName: CoreService.DB_TABLES.package_types,

            uuid: true,

            hasTimestamps: true
        }
    );
};
