'use strict';

const Hoek = require('hoek');
const testHelpers = require('../../testHelpers');
const serverSetup = require('./_serverSetup');
const controller = require('../../../../server/plugins/shopping-cart/shoppingCartController');


async function initController() {
    const server = await getServer();
    controller.setServer(server);

    return {
        controller,
        server
    };
}


async function getServer() {
    return await testHelpers.getServer(
        Hoek.clone(serverSetup.manifest),
        serverSetup.composeOptions
    );
}


module.exports = {
    getServer,
    initController
}
