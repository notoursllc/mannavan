'use strict';

const domainName = 'goBreadVan.com';

let currentNotification = null;

export default {

    methods: {
        getHelpEmailAddress() {
            return `info@${domainName}`;
        },

        getBrandName() {
            return 'BreadVan';
        },

        getSiteName() {
            return domainName;
        },

        getSiteUrl(full) {
            if(process.env.NODE_ENV === 'development') {
                return full ? 'http://localhost:3000' : 'localhost:3000';
            }
            else {
                return full ? `https://www.${domainName}` : `www.${domainName}`;
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
                return this.$axios.$post('/logger', {
                    type: type || 'error',
                    message: message
                });
            }
        },

        singletonNotification(Notification) {
            if(currentNotification) {
                currentNotification.close();
            }

            currentNotification = Notification
        }

    }

}
