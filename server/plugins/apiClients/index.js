const hapiAuthBasic = require('hapi-auth-basic');
const Joi = require('joi');
const Boom = require('boom');
const HelperService = require('../../helpers.service');
const Bcrypt = require('bcrypt');


let internals = {};


internals.after = function (server, next) {

    server.register(hapiAuthBasic);

    const validate = function (request, username, password, callback) {
        Bcrypt.compare(password, process.env.API_PASSWORD_HASH, (err, isValid) => {
            callback(err, isValid, { id: process.env.API_USERNAME });
        });
    };

    // server.auth.strategy('simple', 'basic', true, {
    //     validateFunc: validate
    // })
    server.auth.strategy('simple', 'basic', {
        validateFunc: validate
    })

    // default auth strategy avoids server crash for routes without auth config
    server.auth.default('simple')


    // LOADING BOOKSHELF MODEL:
    let baseModel = require('bookshelf-modelbase')(server.app.bookshelf);

    server.app.bookshelf.model(
        'ApiClients',
        require('./models/ApiClients')(baseModel, server.app.bookshelf, server)
    );

    return next();
}


exports.register = (server, options, next) => {
    server.dependency('BookshelfOrm', internals.after);
    return next();
};

exports.register.attributes = require('./package.json');
