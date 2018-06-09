'use strict';


const after = function (server) {
    // LOADING BOOKSHELF MODEL:
    let baseModel = require('bookshelf-modelbase')(server.app.bookshelf);
    server.app.bookshelf.model(
        'Customer',
        require('./models/Customer')(baseModel, server.app.bookshelf, server)
    );
};


exports.plugin = {
    once: true,
    pkg: require('./package.json'),
    register: function (server, options) {
        server.dependency('BookshelfOrm', after);
    }
};
