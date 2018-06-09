const Joi = require('joi');
const Hoek = require('hoek');


exports.plugin = {
    once: true,
    pkg: require('./package.json'),
    register: function (server, options) {
        let knex;
        let bookshelf = null;
        let bookshelfPlugins = ['registry', 'virtuals', 'visibility', 'pagination', 'bookshelf-uuid'];

        const schema = Joi.object().keys({
            knex: Joi.object().keys({
                client: Joi.string().optional(),
                connection: Joi.string().optional(),
                debug: Joi.boolean().optional()
            }).optional()
        });

        const validateOptions = schema.validate(options);
        if (validateOptions.error) {
            global.logger.error(validateOptions.error);
            throw new Error(validateOptions.error);
        }

        const settings = Hoek.applyToDefaults(
            { knex: require('../../../knexfile') },
            options
        );

        try {
            knex = require('knex')(settings.knex);
        }
        catch (ex) {
            throw new Error('Bad Knex Options: ' + ex.toString());
        }

        try {
            bookshelf = require('bookshelf');
            bookshelf = bookshelf(knex);
        }
        catch (ex) {
            throw new Error('Bookshelf setup error: ' + ex.toString());
        }

        bookshelfPlugins.map(function (plugin) {
            bookshelf.plugin(plugin);
        });

        server.app.bookshelf = bookshelf;
        server.app.knex = knex
    }
};
