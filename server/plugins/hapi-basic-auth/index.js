const Bcrypt = require('bcrypt');

exports.plugin = {
    once: true,
    pkg: require('./package.json'),
    register: function (server, options) {
        server.register(require('hapi-auth-basic'));

        const validate = async function (request, username, password, h) {
            if (!username
                || !password
                || username != process.env.API_USERNAME) {
                global.logger.info('BASIC AUTH VALIDATION FAILED');
                return { credentials: null, isValid: false };
            }


            const isValid = await Bcrypt.compare(password, process.env.API_PASSWORD_HASH);
            const credentials = { id: username };

            if(!isValid) {
                global.logger.info('BASIC AUTH VALIDATION FAILED - password does not match hash');
            }

            return { isValid, credentials };
        };

        server.auth.strategy('simple', 'basic', { validate });
        server.auth.default('simple');
    }
};
