'use strict';

export default {

    methods: {
        getHelpEmailAddress() {
            return 'help@gmnst.com';
        },

        getBrandName() {
            return 'Gmnst';
        },

        getSiteName() {
            return 'gmnst.com';
        },

        getSiteUrl(full) {
            if(process.env.NODE_ENV === 'development') {
                return full ? 'http://localhost:3000' : 'localhost:3000';
            }
            else {
                return full ? 'https://www.gmnst.com' : 'www.gmnst.com';
            }
        },

        getTwitterUser() {
            return 'gmnstLife';
        },

        getApiErrorMessage(error) {
            let msg = error.message;

            if (error.response) {
                msg = error.response.data.message;
            }

            return msg;
        },

        logger(type, message) {
            if(message) {
                return this.$axios.$post('/api/v1/logger', {
                    type: type || 'error',
                    message: message
                });
            }
        },
    }

}
