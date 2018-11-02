const Path = require('path');
const testHelpers = require('../../testHelpers');


let manifest = testHelpers.getBasicManifest();
manifest.register.plugins.push(
    { plugin: './plugins/products' },
    {
        plugin: './plugins/shipping',
        routes: {
            prefix: '/api/v1'
        }
    },
    {
        plugin: './plugins/payment',
        routes: {
            prefix: '/api/v1'
        }
    },
    {
        plugin: './plugins/shopping-cart',
        routes: {
            prefix: '/api/v1'
        }
    }
);

let composeOptions = {
    // Relative to the real hapi server
    relativeTo: Path.resolve(__dirname, '../../../../server')
};


module.exports.manifest = manifest;
module.exports.composeOptions = composeOptions;
