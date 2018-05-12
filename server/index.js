const Glue = require('glue');

if(process.env.NODE_ENV === 'development') {
    require('dotenv').config();
}

exports.init = function (manifest, options, next) {
    Glue.compose(manifest, options, (err, server) => {
        if (err) {
            return next(err);
        }

        server.start((err) => {
            return next(err, server);
        });
    });
};


/*
 * The Hapi v17 way:
 */
 
// exports.init = async function (manifest, options) {
//     const webServer = await Glue.compose(manifest, options);
//     await webServer.start();
// };
