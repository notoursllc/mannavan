// require('dotenv').config();  // TODO: not sure if this works here
const pkg = require('./package');
const globalTypes = require('./shopBac/server/global_types');

module.exports = {
    mode: 'universal',

    /*
    ** Headers
    ** Common headers are already provided by @nuxtjs/pwa preset
    */
    head: {
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
            { src: 'https://js.squareup.com/v2/paymentform', body: true, async: true }
        ],
    },

    meta: {
        name: 'BreadVan',
        theme_color: '#e66d17'
    },

    env: {
        API_USERNAME: process.env.API_USERNAME,
        API_PASSWORD: process.env.API_PASSWORD,
        AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
        AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
        BUG_SNAG_API_KEY: process.env.BUG_SNAG_API_KEY,
        DOMAIN_NAME: process.env.DOMAIN_NAME,
        EMAIL_INFO: process.env.EMAIL_INFO,
        GLOBAL_TYPES: globalTypes,
        NODE_ENV: process.env.NODE_ENV,
        PRODUCT_SUBTYPE_WHITELIST: process.env.PRODUCT_SUBTYPE_WHITELIST,
        SHIPPING_ADDRESS_FROM_COMPANY: process.env.SHIPPING_ADDRESS_FROM_COMPANY,
        SHIPPING_ADDRESS_FROM_ADDRESS1: process.env.SHIPPING_ADDRESS_FROM_ADDRESS1,
        SHIPPING_ADDRESS_FROM_CITY: process.env.SHIPPING_ADDRESS_FROM_CITY,
        SHIPPING_ADDRESS_FROM_STATE: process.env.SHIPPING_ADDRESS_FROM_STATE,
        SHIPPING_ADDRESS_FROM_ZIP: process.env.SHIPPING_ADDRESS_FROM_ZIP,
        SHIPPING_ADDRESS_FROM_COUNTRY_CODE: process.env.SHIPPING_ADDRESS_FROM_COUNTRY_CODE,
        SHIPPING_ADDRESS_FROM_PHONE: process.env.SHIPPING_ADDRESS_FROM_PHONE,
        SQUARE_APP_ID: process.env.NODE_ENV === 'development' ? process.env.SQUARE_SANDBOX_APP_ID : process.env.SQUARE_PRODUCTION_APP_ID,
        SQUARE_ACCESS_TOKEN: process.env.NODE_ENV === 'development' ? process.env.SQUARE_SANDBOX_ACCESS_TOKEN : process.env.SQUARE_PRODUCTION_ACCESS_TOKEN,
        SQUARE_LOCATION_ID: process.env.NODE_ENV === 'development' ? process.env.SQUARE_SANDBOX_LOCATION_ID : process.env.SQUARE_PRODUCTION_LOCATION_ID,
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
        '@/plugins/axios.js',
        '@/plugins/i18n.js',
        '@/plugins/element-ui',
        '@/plugins/vuelidate',
        '@/plugins/format8601',
        '@/plugins/prettyJson',
        { src: '@/plugins/youtube', ssr: false },
        { src: '@/plugins/bugsnag', ssr: false },
        { src: '@/plugins/paypal-button/paypal-button.js', ssr: false }
    ],

    router: {
        middleware: [
            'check-auth',
            'in-checkout'
        ]
    },

    /*
    ** Nuxt.js modules
    */
    modules: [
        '@nuxtjs/axios',
        '@nuxtjs/proxy',
        ['@nuxtjs/pwa', { oneSignal: false }]
    ],

    /*
    ** Axios module configuration
    *  See https://github.com/nuxt-community/axios-module#options
    */
    axios: {
        // proxy: true,
        // baseURL: process.env.NODE_ENV === 'production' ? 'https://www.gobreadvan.com:3000' : 'http://localhost:3000',
        // prefix: '/api/v1',
        debug: process.env.API_DEBUG || false,
        https: process.env.API_USE_HTTPS || true,
        retry: { retries: 3 },
        progress: true
    },

    // proxy: {
    //     // '/api/': { target: process.env.API_URL, pathRewrite: {'^/api/': ''} }
    //     '/products': 'foo'
    //     // '/api/': 'https://www.gobreadvan.com:3000/api/v1'
    // },

    /**
     *  Build configuration
     */
    build: {
        // analyze: true,
        transpile: [/^element-ui/],

        /*
        ** You can extend webpack config here
        */
        // extend(config, ctx) {
        //     // Run ESLint on save
        //     if (ctx.isDev && ctx.isClient) {
        //         config.module.rules.push({
        //             enforce: 'pre',
        //             test: /\.(js|vue)$/,
        //             loader: 'eslint-loader',
        //             exclude: /(node_modules)/
        //         })
        //     }
        // }
    },

    pageTransition: {
        name: 'fade',
        mode: 'out-in'
    }
}
