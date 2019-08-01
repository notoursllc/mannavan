'use strict';

let currentNotification = null;

export default {

    methods: {
        getApiErrorMessage(error) {
            let msg = error.message;

            if (error.response) {
                msg = error.response.data.message;
            }

            return msg;
        },

        logger(type, message) {
            if(message) {
                return this.$axios.$post('/logger', {
                    type: type || 'error',
                    message: message
                });
            }
        }

    }

}
