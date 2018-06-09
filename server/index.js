const Glue = require('glue');

if(process.env.NODE_ENV === 'development') {
    require('dotenv').config();
}


exports.init = async function (manifest, options) {
    const webServer = await Glue.compose(manifest, options);
    await webServer.start();
};
