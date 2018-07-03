const Glue = require('glue');

if(process.env.NODE_ENV === 'development') {
    require('dotenv').config();
}


exports.init = async function (manifest, options) {
    const server = await Glue.compose(manifest, options);
    await server.start();
    return server;
};
