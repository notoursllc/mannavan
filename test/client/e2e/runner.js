'use strict';

process.env.NODE_ENV = 'production'

require('dotenv').config();

const Hoek = require('hoek');
const Path = require('path');
const spawn = require('cross-spawn')
const Server = require('../../../server');
const manifest = require('../../../server/manifest');


Server.init(manifest, {relativeTo: Path.resolve(__dirname, '../../../server')}, (err, server) => {
    if(err) {
        console.log('ERROR STARTING SERVER', err);
    }
    Hoek.assert(!err, err);

    const api = server.select('api');
    console.log('API server started at: ' + api.info.uri);

    // let runner = spawn('./node_modules/.bin/wdio', ['./wdio.conf.js'], { stdio: 'inherit' })
    let runner = spawn('./node_modules/.bin/wdio', ['./test/client/e2e/wdio.conf.js'], { stdio: 'inherit' })

    runner.on('close', function (code) {
        server.stop();
        process.exit(code)
    })

    runner.on('exit', function (code) {
        server.stop();
        process.exit(code)
    })

    runner.on('error', function (err) {
        server.stop();
        throw err
    });
});