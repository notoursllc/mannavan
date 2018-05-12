'use strict';

const isString = require('lodash.isstring');
const forEach = require('lodash.foreach');
const queryString = require('query-string');


function queryHelper(request) {
    let response = {
        pageSize: null,
        page: null,
        orderBy: null,
        orderDir: 'DESC',
        where: null,
        whereRaw: null,
        andWhere: null,
        limit: null
    };

    let parsed = queryString.parse(request.url.search, {arrayFormat: 'bracket'});

    if(parsed.pageSize) {
        response.pageSize = parseInt(parsed.pageSize, 10) || null;
    }
    if(parsed.page) {
        response.page = parseInt(parsed.page, 10) || null;
    }
    if(parsed.limit) {
        response.limit = parseInt(parsed.limit, 10) || null;
    }
    if(parsed.orderDir === 'DESC' || parsed.orderDir === 'ASC') {
        response.orderDir = parsed.orderDir;
    }
    if(parsed.orderBy) {
        response.orderBy = parsed.orderBy;
    }
    if(parsed.whereRaw) {
        response.whereRaw = parsed.whereRaw;
    }
    if(parsed.where) {
        response.where = parsed.where;

        // and where:
        // andWhere: [ 'product_type_id,=,3', 'inventory_count,>,0' ]
        if(parsed.andWhere) {
            let andWhere = [];

            if(Array.isArray(parsed.andWhere)) {
                forEach(parsed.andWhere, (val) => {
                    if(isString(val)) {
                        val = val.split(',').map((item) => {
                            return item.trim()
                        });
                    }

                    if(Array.isArray(val) && val.length === 3) {
                        andWhere.push(val);
                    }
                });

                if(andWhere.length) {
                    response.andWhere = andWhere;
                }
            }
        }
    }

    return response;
}


/**
 * A helper method for querying Bookshelf models
 * 
 * http://bookshelfjs.org/#Model-instance-fetchPage
 * 
 * @param {*} request 
 * @param {*} model 
 * @param {*} withRelated 
 */
function fetchPage(request, model, withRelated) {
    let queryData = queryHelper(request);
    let config = {};

    if(queryData.hasOwnProperty('limit') && queryData.limit) {
        config.limit = queryData.limit;

        if(queryData.hasOwnProperty('offset')) {
            config.offset = queryData.offset;
        }
    }
    else {
        config = {
            pageSize: queryData.pageSize || 100,
            page: queryData.page || 1
        } 
    }

    if(Array.isArray(withRelated) && withRelated.length) {
        config.withRelated = withRelated;
    }

    return model.query((qb) => {
        // qb.innerJoin('manufacturers', 'cars.manufacturer_id', 'manufacturers.id');
        // qb.groupBy('cars.id');

        if(queryData.where) {
            qb.where(queryData.where[0], queryData.where[1], queryData.where[2]);
        }

        if(queryData.whereRaw) {
            if(queryData.whereRaw.length === 1) {
                qb.whereRaw(queryData.whereRaw);
            }
            else {
                qb.whereRaw(queryData.whereRaw.shift(), queryData.whereRaw);
            }
        }

        if(queryData.andWhere) {
            forEach(queryData.andWhere, function(arr) {
                qb.andWhere(arr[0], arr[1], arr[2]);
            });
        }
    })
    .orderBy(queryData.orderBy, queryData.orderDir)
    .fetchPage(config);
}


function isDev() {
    return process.env.NODE_ENV === 'development';
}


function makeArray(val) {
    return !Array.isArray(val) ? [val] : val;
}


// https://stackoverflow.com/questions/4187146/display-two-decimal-places-no-rounding#4187164
function twoPointDecimal(value) {
    return value.toString().match(/^-?\d+(?:\.\d{0,2})?/)[0];   // '4.27' => '4.27'
    //return (Math.floor(value * 100) / 100).toFixed(2)         // '4.27' => '4.26'  <== toFixed rounds values!
}


function stripTags(text) {
    if(text) {
        return text.replace(/(<([^>]+)>)/ig, '');
    }

    return text;
}

function stripQuotes(text) {
    if(text) {
        return text.replace(/["']/g, '');
    }

    return text;
}


module.exports.queryHelper = queryHelper;
module.exports.fetchPage = fetchPage;
module.exports.isDev = isDev;
module.exports.makeArray = makeArray;
module.exports.twoPointDecimal = twoPointDecimal;
module.exports.stripTags = stripTags;
module.exports.stripQuotes = stripQuotes;