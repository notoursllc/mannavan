'use strict';

const { getList, getSingle, postCreate } = require('./helpers')
const basePath = '/customs/declarations';


/**
 * Retrieve the entire list of customs declaration objects.
 *
 * API REFERENCE: https://goshippo.com/docs/reference/bash#customs-declarations
 */
async function listCustomsDeclarations() {
    return await getList(basePath)
}


/**
 * Retrieve a customs declaration object.
 *
 * API REFERENCE: https://goshippo.com/docs/reference/bash#customs-declarations-retrieve
 */
async function getCustomsDeclaration(customsDeclarationObjectId) {
    return await getSingle(`${basePath}/${customsDeclarationObjectId}`)
}


/**
 * Creates a new Customs Declaration object.
 *
 * API REFERENCE: https://goshippo.com/docs/reference/bash#customs-declarations-create
 *
 * @param {*} data
 */
async function createCustomsDeclaration(data) {
    return await postCreate(basePath, data)
}


module.exports = {
    listCustomsDeclarations,
    getCustomsDeclaration,
    createCustomsDeclaration
}



