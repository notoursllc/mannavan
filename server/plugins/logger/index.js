const winston = require('winston');
const bugsnag = require('bugsnag');
const { Loggly } = require('winston-loggly-bulk');

// NOTE: 7/7/18 - Loggly does not work with Winston 3.0 yet:
// https://github.com/loggly/winston-loggly-bulk/issues/32

exports.plugin = {
    once: true,
    pkg: require('./package.json'),
    register: function (server, options) {
        // Bugsnag setup:
        bugsnag.register(process.env.BUG_SNAG_API_KEY, {
            releaseStage: 'production',
            // autoNotifyUnhandledRejection: false // https://docs.bugsnag.com/platforms/nodejs/other/
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


        // https://github.com/loggly/winston-loggly-bulk
        const logglyTransport = new Loggly({
            token: process.env.LOGGLY_PRIVATE_KEY,
            subdomain: "notours",
            tags: ["backend"],
            json: true,
            level: 'info',
            networkErrorsOnConsole: true
        });


        let transports = [];
        let exceptionHandlers = [];

        if(process.env.NODE_ENV === 'production') {
            transports.push(logglyTransport);
            exceptionHandlers.push(logglyTransport);
        }
        else {
            transports.push(
                new (winston.transports.Console)({
                    level: 'debug',
                    prettyPrint: true,
                    colorize: true,
                    silent: false
                })
            );

            exceptionHandlers.push(
                new (winston.transports.Console)({
                    prettyPrint: true,
                    colorize: true,
                    silent: false,
                    handleExceptions: true,
                    humanReadableUnhandledException: true
                })
            )
        }

        const logger = new (winston.Logger)({
            transports,
            exceptionHandlers,
            exitOnError: false
        });

        global.logger = logger
    }
};
