const Hoek = require('hoek');


exports.register = (server, options, next) =>  {

    let defaultOpts = {
        restful: true,
        cookieOptions: {
            isSecure: false
        }
    };

    server.register(
        {
            register: require('crumb'),
            options: Hoek.applyToDefaults(defaultOpts, options)
        },
        (err) => {
            if (err) {
                return next(err);
            }

            return next();
        }
    );
};


exports.register.attributes = require('./package.json');
