// https://insightops.help.rapid7.com/docs/nodejs
// const LogEntries = require('r7insight_node');
const winston = require('winston');
const Promise = require('bluebird');
const bugsnag = require('bugsnag');


exports.plugin = {
    once: true,
    pkg: require('./package.json'),
    register: function (server, options) {
        // Bugsnag setup:
        bugsnag.register(process.env.BUG_SNAG_API_KEY, {
            releaseStage: 'production'
        });

        global.bugsnag = function() {
            const args = arguments;
            if(process.env.NODE_ENV === 'production') {
                bugsnag.notify(args);
            }
        }

        // Winston setup:
        winston.setLevels({
            debug: 0,
            info: 1,
            warn: 2,
            error: 3
        });

        winston.addColors({
            debug: 'blue',
            info: 'cyan',
            warn: 'yellow',
            error: 'red'
        });

        // https://github.com/rapid7/r7insight_node#options
        // const LogEntries = new (winston.transports.Logentries)({
        //     token: process.env.LOGENTRIES_TOKEN,
        //     region: 'us',
        //     withStack: true
        // });

        let transports = [
            new (winston.transports.Console)({
                level: 'error',
                prettyPrint: true,
                colorize: true,
                silent: false
            }),
            // LogEntries
        ];

        let exceptionHandlers = [
            new winston.transports.Console({
                handleExceptions: true,
                humanReadableUnhandledException: true
            }),
            // LogEntries
        ];

        const logger = new (winston.Logger)({
            transports,
            exceptionHandlers,
            exitOnError: false
        });

        global.logger = logger
    }
};
