import Vue from 'vue';
import VueI18n from 'vue-i18n';
import en_US from '@/locales/en-US.js';

Vue.use(VueI18n);

export default ({ app, store }) => {
    // Set `i18n` instance on `app`
    // This way we can use it in middleware and pages `asyncData`/`fetch`
    app.i18n = new VueI18n({
        locale: store.state.ui.locale || 'en-US',

        fallbackLocale: 'en-US',

        messages: {
            'en-US': en_US
        //   'fr': require('~/locales/fr.json')
        },

        // http://kazupon.github.io/vue-i18n/en/datetime.html
        dateTimeFormats: {
            'en-US': {
                short: {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                },
                long: {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    weekday: 'short',
                    hour: 'numeric',
                    minute: 'numeric'
                }
            }
        },

        // http://kazupon.github.io/vue-i18n/en/number.html
        numberFormats: {
            'en-US': {
                currency: {
                    style: 'currency',
                    currency: 'USD'
                }
            },
            ja: {
                currency: {
                    style: 'currency',
                    currency: 'JPY',
                    currencyDisplay: 'symbol'
                }
            }
        }
    });
};
