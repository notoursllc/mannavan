const Joi = require('joi');

let internals = {};


internals.after = function (server, next) {

    internals.schema = Joi.object().keys({
        firstName: Joi.string().trim().max(255),
        lastName: Joi.string().trim().max(255),
        company: Joi.string().trim().max(255),
        email: Joi.string().trim().email().max(255).required(),
        phone: Joi.string().trim().max(30).required(),
        fax: Joi.string().trim().max(30),
        website: Joi.string().trim().email().max(255)
    });


    // LOADING BOOKSHELF MODEL:
    let baseModel = require('bookshelf-modelbase')(server.app.bookshelf);

    server.app.bookshelf.model(
        'Customer',
        require('./models/Customer')(baseModel, server.app.bookshelf, server)
    );

    return next();
};


exports.register = (server, options, next) => {
    server.dependency('BookshelfOrm', internals.after);
    return next();
};

exports.register.attributes = require('./package.json');


/*
 * The Hapi v17 way:
 */

// exports.plugin = {
//     once: true,
//     pkg: require('./package.json'),
//     register: function (server, options) {
//         server.dependency('BookshelfOrm', internals.after);
//     }
// };
