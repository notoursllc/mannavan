'use strict';

const Promise = require('bluebird');
const bcrypt = require('bcrypt');
const BaseService = require('../../core/services/BaseService');


module.exports = class ApiClientService extends BaseService {

    constructor(server) {
        super(server, 'ApiClients')
    }

    
    /**
     * Performs additional validation on the decoded JWT token
     *
     * @param decoded
     * @param request
     * @param cb
     */
    validateJwt(decoded, request, cb) {
        // for now no other validation is needed
        cb(null, true);

        // let ApiClients = request.bookshelf.model('ApiClients');
        // ApiClients
        //     .forge({
        //         'client_id': decoded.clientId
        //     })
        //     .fetch()
        //     .then(
        //         (ApiUserModel) => {
        //             if (ApiUserModel && ApiUserModel.get('is_active')) {
        //                 return cb(null, true);
        //             }
        //
        //             return cb(null, false);
        //         }
        //     )
        //     .catch(
        //         (err) => {
        //             cb(null, false);
        //         }
        //     );
    }


    /**
     * Searches for an API user
     *
     * @returns {Promise}
     */
    validateApiUser() {
        let self = this;

        return new Promise((resolve, reject) => {
            return self
                .getModel()
                .forge({
                    client_id: process.env.JWT_CLIENT_ID
                })
                .fetch()
                .then((ApiUserModel) => {
                    if (ApiUserModel) {
                        if (!ApiUserModel.get('is_active')) {
                            throw new Error('Invalid API user');
                        }

                        self
                            .comparePassword(process.env.JWT_CLIENT_SECRET, ApiUserModel.get('client_secret'))
                            .then((isPasswordMatch) => {
                                if (isPasswordMatch) {
                                    return resolve(ApiUserModel.toJSON());
                                }

                                throw new Error('Invalid API user');
                            })
                            .catch((err) => {
                                reject('Invalid API user');
                            });
                    }
                    else {
                        throw new Error('Invalid API user');
                    }
                })
                .catch((err) => {
                    global.logger.error(err)
                    reject('Invalid API user');
                });
        });
    }


    /**
     * Creates a hash from a given password
     *
     * @param password
     * @returns {Promise}
     */
    cryptPassword(password) {
        return new Promise((resolve, reject) => {
            bcrypt.genSalt(10, (err, salt) => {
                if (err) {
                    return reject(err);
                }

                bcrypt.hash(password, salt, (err, hash) => {
                    if (err) {
                        return reject(err);
                    }

                    return resolve(hash); 
                });
            });
        });
    }


    /**
     * Compares a password against the hashed password for a match
     *
     * @param password      Clear password
     * @param userPassword  Hashed password
     * @returns {Promise}
     */
    comparePassword(password, userPassword) {
        return new Promise((resolve, reject) => {
            bcrypt.compare(password, userPassword, (err, isPasswordMatch) => {
                if (err) {
                    return reject(err);
                }

                return resolve(isPasswordMatch);
            });
        });
    }
}