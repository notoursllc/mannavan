// Even though we are using @nuxt/dotenv module, we need to require dotenv here because
// we need the env variables for the nuxt build (in plugins/api.js)
// https://github.com/nuxt-community/dotenv-module#using-env-file-in-nuxtconfigjs
require('dotenv').config();


const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
    mode: 'universal',

    /*
    ** Headers
    ** Common headers are already provided by @nuxtjs/pwa preset
    */
    head: {
        title: process.env.npm_package_name || '',
        meta: [
            { charset: 'utf-8' },
            { name: 'viewport', content: 'width=device-width, initial-scale=1' },
            { hid: 'description', name: 'description', content: process.env.npm_package_description || '' }
        ],
        link: [
            { rel: 'icon', type: 'image/x-icon', href: '/images/favicon.ico' }
        ],
        script: [
            // NOTE: Putting this in the head() of the cart/checkout/index.vue file, instead of here,
            // causes this to be loaded only for that route.  That's a good thing, but it caused a race
            // condition resulting in a javascript error: SqPaymentForm is not defined
            // That's because the CheckoutSectionPayment component, which uses SqPaymentForm, sometimes
            // loads before the head() script is loaded.
            // Putting it here doesn't seem ideal, but it's safest.
            {
                src: isProduction ? 'https://js.squareup.com/v2/paymentform' : 'https://js.squareupsandbox.com/v2/paymentform',
                body: true,
                async: true
            }
        ],
    },

    meta: {
        name: 'BreadVan',
        theme_color: '#e66d17'
    },

    /*
    ** Customize the progress-bar color
    */
    loading: {
        color: '#67c23a',
        height: '4px',
        duration: 5000
    },


    /*
    ** Global CSS
    */
    css: [
        'element-ui/lib/theme-chalk/index.css',
        '@/assets/css/base.scss'
    ],

    /*
    ** Plugins to load before mounting the App
    */
    plugins: [
        '@/plugins/api.js',
        '@/plugins/i18n.js',
        '@/plugins/element-ui',
        '@/plugins/global-properties',
        '@/plugins/vuelidate',
        '@/plugins/format8601',
        '@/plugins/prettyJson',
        { src: '@/plugins/youtube', ssr: false },
        { src: '@/plugins/bugsnag', ssr: false },
        { src: '@/plugins/paypal-button/paypal-button.js', ssr: false }
    ],

    router: {
        middleware: [
            'in-checkout'
        ]
    },

    /*
    ** Nuxt.js modules
    */
    modules: [
        // Doc: https://axios.nuxtjs.org/usage
        '@nuxtjs/axios',
        // Doc: https://github.com/nuxt-community/dotenv-module
        '@nuxtjs/dotenv',
        ['@nuxtjs/pwa', { oneSignal: false }]
    ],

    /*
    ** Axios module configuration
    *  See https://github.com/nuxt-community/axios-module#options
    */
    axios: {
        debug: false,
        https: process.env.API_USE_HTTPS === 'true',
        retry: { retries: 3 },
        progress: true
    },

    /**
     *  Build configuration
     */
    build: {
        // analyze: true,
        transpile: [/^element-ui/],

        /*
        ** You can extend webpack config here
        */
        extend (config, ctx) {
        }
    },

    pageTransition: {
        name: 'fade',
        mode: 'out-in'
    }
}
