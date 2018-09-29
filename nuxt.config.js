// require('dotenv').config();  // TODO: not sure if this works here
const pkg = require('./package');
const isNanoboxDev = process.env.NODE_ENV === 'development' && process.env.DATA_DB_USERS === 'nanobox';

module.exports = {
    mode: 'universal',

    /*
    ** Headers
    ** Common headers are already provided by @nuxtjs/pwa preset
    */
    head: {
        link: [
            { rel: 'icon', type: 'image/x-icon', href: '/images/favicon.ico' }
        ]
    },

    manifest: {
        theme_color: '#67c23a'
    },

    env: {
        API_USERNAME: process.env.API_USERNAME,
        API_PASSWORD: process.env.API_PASSWORD,
        AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
        AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
        BUG_SNAG_API_KEY: process.env.BUG_SNAG_API_KEY,
        EMAIL_CONTACT_US: process.env.EMAIL_CONTACT_US,
        NODE_ENV: process.env.NODE_ENV,
        SHIPPING_ADDRESS_FROM_COMPANY: process.env.SHIPPING_ADDRESS_FROM_COMPANY,
        SHIPPING_ADDRESS_FROM_NAME: process.env.SHIPPING_ADDRESS_FROM_NAME,
        SHIPPING_ADDRESS_FROM_ADDRESS1: process.env.SHIPPING_ADDRESS_FROM_ADDRESS1,
        SHIPPING_ADDRESS_FROM_CITY: process.env.SHIPPING_ADDRESS_FROM_CITY,
        SHIPPING_ADDRESS_FROM_STATE: process.env.SHIPPING_ADDRESS_FROM_STATE,
        SHIPPING_ADDRESS_FROM_ZIP: process.env.SHIPPING_ADDRESS_FROM_ZIP,
        SHIPPING_ADDRESS_FROM_COUNTRY_CODE: process.env.SHIPPING_ADDRESS_FROM_COUNTRY_CODE,
        SHIPPING_ADDRESS_FROM_PHONE: process.env.SHIPPING_ADDRESS_FROM_PHONE,
        SHIPPING_ADDRESS_FROM_EMAIL: process.env.SHIPPING_ADDRESS_FROM_EMAIL
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
        '@/plugins/format8601',
        '@/plugins/prettyJson',
        { src: '@/plugins/bugsnag', ssr: false }
    ],

    router: {
        middleware: [
            'check-auth'
        ]
    },

    /*
    ** Nuxt.js modules
    */
    modules: [
        '@nuxtjs/axios',
        '@nuxtjs/pwa'
    ],

    /*
    ** Axios module configuration
    *  See https://github.com/nuxt-community/axios-module#options
    */
    axios: {
        baseURL: process.env.API_URL || (isNanoboxDev ? 'http://gobreadvan.local:3000/api/v1' : 'http://localhost:3000/api/v1'),
        // baseURL: process.env.API_URL || '/api/v1',
        debug: process.env.API_DEBUG || false,
        https: process.env.API_USE_HTTPS || true,
        retry: { retries: 3 },
        progress: true
    },

    /**
     *  Build configuration
     */
    build: {
        // vendor: ['babel-polyfill', 'vue-i18n'],

        babel: {
            // plugins: [
                // ['transform-es2015-template-literals', {
                //     loose: true,
                //     spec: true
                // }],
                // 'transform-runtime',
                // ['transform-es2015-arrow-functions', {
                //     spec: true
                // }]
            // ],
            // presets: [
            //     ['vue-app', {
            //         targets: { ie: 11, uglify: false },
            //         useBuiltIns: true
            //     }]
            // ]
            // presets: ['es2015', 'stage-2'],
            // plugins: ['transform-runtime']
            // presets: [
            //     ['env', {
            //         'targets': {
            //             'browsers': ['last 2 versions', 'ie >= 11']
            //             // 'browsers': [
            //             //     'Explorer 11'
            //             // ]
            //         },
            //         'useBuiltIns': true
            //     }]
            // ]
        },

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

    transition: {
        name: 'fade',
        mode: 'out-in'
    }
}
