'use strict';

const Hoek = require('hoek');
const testHelpers = require('../../testHelpers');
const serverSetup = require('./_serverSetup');
const productsController = require('../../../../shopBac/server/plugins/products/productsController');
const productPicController = require('../../../../shopBac/server/plugins/products/productPicController');
const productSizeController = require('../../../../shopBac/server/plugins/products/productSizeController');


async function getServer() {
    return await testHelpers.getServer(
        Hoek.clone(serverSetup.manifest),
        serverSetup.composeOptions
    );
}

async function initProductsController() {
    const server = await getServer();
    productsController.setServer(server);

    return {
        controller: productsController,
        server
    };
}

async function initProductPicController() {
    const server = await getServer();
    productPicController.setServer(server);

    return {
        controller: productPicController,
        server
    };
}

async function initProductSizeController() {
    const server = await getServer();
    productSizeController.setServer(server);

    return {
        controller: productSizeController,
        server
    };
}


module.exports = {
    getServer,
    initProductsController,
    initProductPicController,
    initProductSizeController
}
