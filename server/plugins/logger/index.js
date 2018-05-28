const winston = require('winston');
// const RotateFile = require('winston-daily-rotate-file');
const Promise = require('bluebird');
const path = require('path');
const bugsnag = require('bugsnag')

// LogEntries logging service
// https://insightops.help.rapid7.com/docs/nodejs
const LogEntries = require('r7insight_node');

// https://github.com/rapid7/r7insight_node#options
// Note: by default the error level is called 'err'.  The 'levels'
// config below renames it to 'error'
const logEntriesLogger = new LogEntries({
    token: process.env.LOGENTRIES_TOKEN,
    region: 'us',
    console: true,
    levels: {
        error: 4
    },
    withStack: true
});


// function getFormattedDate() {
//     let date = new Date();
//     let mo = date.getMonth() + 1;
//     mo = mo < 10 ? '0' + mo : mo;

//     let day = date.getDate();
//     day = day < 10 ? '0' + day : day;

//     let ymd = [
//         date.getFullYear(),
//         mo,
//         day
//     ];

//     let hms = [
//         date.getHours(),
//         date.getMinutes(),
//         date.getSeconds()
//     ];

//     return (ymd.join('-') + ' ' + hms.join(':'));
// }

exports.register = (server, options, next) => {

    // Bugsnag setup:
    bugsnag.register(process.env.BUG_SNAG_API_KEY);
    global.bugsnag = function() {
        let args = arguments;

        return new Promise((resolve, reject) => {
            if(process.env.NODE_ENV === 'production') {
                bugsnag.notify(args);
            }
            resolve();
        });
    };

    // Winston setup:
    // winston.setLevels({
    //     debug: 0,
    //     info: 1,
    //     warn: 2,
    //     error: 3
    // });

    // winston.addColors({
    //     debug: 'blue',
    //     info: 'cyan',
    //     warn: 'yellow',
    //     error: 'red'
    // });


    // let transports = [
    //     new (winston.transports.Console)({
    //         level: 'error',
    //         prettyPrint: true,
    //         colorize: true,
    //         silent: false,
    //         timestamp: getFormattedDate
    //     })
    // ];

    // let exceptionHandlers = [
    //     new winston.transports.Console({
    //         handleExceptions: true,
    //         humanReadableUnhandledException: true
    //     })
    // ];

    // let logsDirectory = path.join(__dirname, '../../../', 'logs');

    // let fileConfig = {
    //     name: 'error-file',
    //     level: 'error',
    //     prettyPrint: true,
    //     silent: false,
    //     colorize: false,
    //     filename: path.join(logsDirectory, '/error.log'),
    //     timestamp: getFormattedDate,
    //     json: false,
    //     maxFiles: 10,
    //     datePattern: '.yyyy-MM-dd'
    // };

    //TODO: fix this in nuxt:
    // transports.push(
    //     new (RotateFile)(fileConfig),
    //     new (RotateFile)(
    //         Object.assign(
    //             {},
    //             fileConfig,
    //             {
    //                 name: 'info-file',
    //                 level: 'info',
    //                 filename: path.join(logsDirectory, '/info.log')
    //             }
    //         )
    //     )
    // );

    // exceptionHandlers.push(
    //     new (RotateFile)(fileConfig)
    // )


    // const logger = new (winston.Logger)({
    //     transports,
    //     exceptionHandlers,
    //     exitOnError: false
    // });



    // inject global function
    // global.logger = logger
    global.logger = logEntriesLogger

    //test
    global.logger.error('Logentries test');

    return next();
};

exports.register.attributes = require('./package.json');
