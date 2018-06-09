const server = require('./index');
const manifest = require('./manifest');


const startServer = async function() {
    try {
        const options = {
            relativeTo: __dirname
        };

        await server.init(manifest, options);
        console.log('API server started!');
    }
    catch(err) {
        console.log("ERROR STARTING SERVER:", err);
        process.exit(1);
    }
}

startServer();
