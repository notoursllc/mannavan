const Hoek = require('hoek');
const Server = require('./index');
const manifest = require('./manifest');

let internals = {};

internals.composeOptions = {
    relativeTo: __dirname
};


Server.init(manifest, internals.composeOptions, (err, server) => {
    if (err) {
        global.logger.error(err);
        global.bugsnag(err);
    }
    Hoek.assert(!err, err);

    const api = server.select('api');
    console.log('API server started at: ' + api.info.uri);
});



/*
 * The Hapi v17 way:
 */
 /*
const manifest = {
    server: {
        // cache: 'redis',
        port: Config.get('/port/api')
    },
    register: {
        plugins: [
            {
                plugin: require('./plugins/bookshelf-orm'),
                options: {
                    knex: {
                        debug: Config.get('/db/debug')
                    },
                    plugins: [
                        require('bookshelf-uuid')
                    ]
                }
            },
            {
                plugin: require('./plugins/customer')
            },
            {
                plugin: require('./plugins/apiClients'),
                options: {
                    routes: {
                        prefix: '/api/v1'
                    }
                }
            }
        ]
    }
};

const options = {
    relativeTo: __dirname
};

try {
    Server.init(manifest, options);
    console.log('Web server started.');
}
catch (err) {
    console.error(err);
    process.exit(1);
}
*/
