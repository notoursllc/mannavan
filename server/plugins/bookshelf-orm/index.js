const Joi = require('joi');
const Hoek = require('hoek');
const knexConfig = require('../../../knexfile');

let internals = {};

internals.schema = Joi.object().keys({
    knex: Joi.object().keys({
        client: Joi.string().optional(),
        connection: Joi.string().optional(),
        debug: Joi.boolean().optional()
    }).optional(),
    // plugins: Joi.array().items(Joi.string()).default([]),
    plugins: Joi.array(),
    namespace: Joi.string()
});

internals.defaults = {
    knex: knexConfig
};


exports.register = (server, options, next) => {
    let knex;
    let bookshelf = null;
    let requiredPlugins = ['registry', 'virtuals', 'visibility', 'pagination'];

    const validateOptions = internals.schema.validate(options);
    if (validateOptions.error) {
        global.logger.error(validateOptions.error);
        return next(validateOptions.error);
    }

    const settings = Hoek.applyToDefaults(internals.defaults, options);
    settings.plugins = Array.isArray(settings.plugins) ? requiredPlugins.concat(settings.plugins) : requiredPlugins;

    try {
        knex = require('knex')(settings.knex);
        bookshelf = require('bookshelf');
        bookshelf = bookshelf(knex);
    }
    catch (ex) {
        return next(new Error('Bad Knex Options: ' + ex.toString()));
    }

    settings.plugins.map(function (plugin) {
        bookshelf.plugin(plugin);
    });

    if (settings.namespace) {
        server.app[settings.namespace] = bookshelf;
    }
    else {
        server.app.bookshelf = bookshelf;
    }

    server.app.knex = knex

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
//         let knex;
//         let bookshelf = null;
//         let requiredPlugins = ['registry', 'virtuals', 'visibility', 'pagination'];
//
//         const validateOptions = internals.schema.validate(options);
//         if (validateOptions.error) {
//             global.logger.error(validateOptions.error);
//             // return next(validateOptions.error);
//             throw new Error(validateOptions.error);
//         }
//
//         const settings = Hoek.applyToDefaults(internals.defaults, options);
//         settings.plugins = Array.isArray(settings.plugins) ? requiredPlugins.concat(settings.plugins) : requiredPlugins;
//
//         try {
//             knex = require('knex')(settings.knex);
//             bookshelf = require('bookshelf');
//             bookshelf = bookshelf(knex);
//         }
//         catch (ex) {
//             // return next(new Error('Bad Knex Options: ' + ex.toString()));
//             throw new Error('Bad Knex Options: ' + ex.toString());
//         }
//
//         settings.plugins.map(function (plugin) {
//             bookshelf.plugin(plugin);
//         });
//
//         if (settings.namespace) {
//             server.expose(settings.namespace, bookshelf);
//         }
//         else {
//             // server.expose(bookshelf);
//             server.expose('bookshelf', bookshelf);
//         }
//
//         server.expose('knexObject', knex);
//     }
// };
