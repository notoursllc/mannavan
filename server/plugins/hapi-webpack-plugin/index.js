const webpack = require('webpack');
const path = require('path');


exports.register = (server, options, next) =>  {

    // https://medium.com/@tkh44/setting-up-your-front-end-dev-environment-with-webpack-with-hapi-b352ab8b2f9c
    const compiler = webpack(options.config);
    const devMiddleware = require('webpack-dev-middleware')(compiler, options['webpack-dev-middleware'] || {});
    const hotMiddleware = require('webpack-hot-middleware')(compiler, options['webpack-hot-middleware'] || {
        // log: () => {},
        noInfo: true
    });

    server.ext('onRequest', (request, reply) => {
        let url = request.raw.req.url;

        if(url.indexOf('/api/') !== -1) {
            return reply.continue()
        }
        else {
            devMiddleware(request.raw.req, request.raw.res, (err) => {
                if (err) {
                    return reply(err);
                }
                return reply.continue();
            });
        }
    });

    server.ext('onRequest', (request, reply) => {
        let url = request.raw.req.url;

        if(url.indexOf('/api/') !== -1) {
            return reply.continue()
        }
        else {
            hotMiddleware(request.raw.req, request.raw.res, (err) => {
                if (err) {
                    return reply(err);
                }
                return reply.continue();
            });
        }
    });

    server.ext('onPreResponse', (request, reply) => {
        let url = request.raw.req.url;

        if(url.indexOf('/api') !== -1 || url.indexOf('/product/share') !== -1) {
            return reply.continue();
        }
        else {
            // This assumes you are using the html-webpack-plugin
            // If you are serving a static html file just reply with that file directly
            const filename = path.join(compiler.outputPath, 'index.html');

            // The returned HTML will include the auto-injected js file(s)
            compiler.outputFileSystem.readFile(filename, (fileReadErr, result) => {
                if (fileReadErr) {
                    return reply(fileReadErr);
                }
                reply(result).type('text/html');
            });
        }
    });

    return next();
};

exports.register.attributes = require('./package.json');
