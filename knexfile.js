if(process.env.NODE_ENV === 'development') {
    require('dotenv').config();
}

const cloneDeep = require('lodash.clonedeep');

let common = {
    client: 'postgres',
    pool: {
        min: 2,
        max: 10,
        afterCreate: function (conn, done) {
            // in this example we use pg driver's connection API
            conn.query('SET timezone="UTC";', function (err) {
                done(err, conn);
            });
        }
    },
    migrations: {
        directory: './db/migrations',
        tableName: 'knex_migrations'
    },
    seeds: {
        directory: './db/seeds'
    },
    connection: {
        host: process.env.DATA_DB_HOST,
        user: process.env.DATA_DB_USER,
        password: process.env.DATA_DB_PASS,
        database: process.env.ISNANO ? 'gonano' : process.env.DATA_DB_NAME
    }
};

// if(process.env.IS_LOCAL) {
// if(process.env.NODE_ENV === 'development') {
//     common.connection = {
//         host: process.env.POSTGRES_HOST_LOCAL,
//         user: process.env.POSTGRES_USER_LOCAL,
//         password: process.env.POSTGRES_PASSWORD_LOCAL,
//         database: process.env.POSTGRES_DB_LOCAL 
//     }
// }

// Not sure if these are needed on nanobox so commenting out for now:
// if(process.env.NODE_ENV === 'production') {
//     common.connection.port = 5432;
//     common.connection.ssl = true;
// }

let config = {
    development: cloneDeep(common),
    production: cloneDeep(common)
};

let env = process.env.NODE_ENV === 'production' ? 'production' : 'development';
module.exports = config[env];