const Path = require('path');
const testHelpers = require('../../testHelpers');


let manifest = testHelpers.getBasicManifest();
manifest.register.plugins.push(
    { plugin: './plugins/shipping' }
);


let composeOptions = {
    // Relative to the real hapi server
    relativeTo: Path.resolve(__dirname, '../../../../server')
};


module.exports.manifest = manifest;
module.exports.composeOptions = composeOptions;
