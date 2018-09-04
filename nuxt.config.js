// require('dotenv').config();  // TODO: not sure if this works here
const pkg = require('./package');
const isNanoboxDev = process.env.NODE_ENV === 'development' && process.env.DATA_DB_USERS === 'nanobox';

module.exports = {
    mode: 'universal',

    /*
    ** Headers of the page
    */
    head: {
        title: pkg.name,
        meta: [
            { charset: 'utf-8' },
            { name: 'viewport', content: 'width=device-width, initial-scale=1' },
            { hid: 'description', name: 'description', content: pkg.description },
            // { name: 'msapplication-TileColor', content: '#ffffff' },
            // { name: 'msapplication-TileImage', content: '/images/favicons/ms-icon-144x144.png' },
        ],
        link: [
            { rel: 'icon', type: 'image/x-icon', href: '/images/favicons/favicon.ico' },
            { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/images/favicons/favicon-16x16.png' },
            { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/images/favicons/favicon-32x32.png' },
            { rel: 'icon', type: 'image/png', sizes: '96x96', href: '/images/favicons/favicon-96x96.png' },
            { rel: 'apple-touch-icon', sizes: '57x57', href: '/images/favicons/apple-icon-57x57.png' },
            { rel: 'apple-touch-icon', sizes: '60x60', href: '/images/favicons/apple-icon-60x60.png' },
            { rel: 'apple-touch-icon', sizes: '72x72', href: '/images/favicons/apple-icon-72x72.png' },
            { rel: 'apple-touch-icon', sizes: '76x76', href: '/images/favicons/apple-icon-76x76.png' },
            { rel: 'apple-touch-icon', sizes: '114x114', href: '/images/favicons/apple-icon-114x114.png' },
            { rel: 'apple-touch-icon', sizes: '120x120', href: '/images/favicons/apple-icon-120x120.png' },
            { rel: 'apple-touch-icon', sizes: '144x144', href: '/images/favicons/apple-icon-144x144.png' },
            { rel: 'apple-touch-icon', sizes: '152x152', href: '/images/favicons/apple-icon-152x152.png' },
            { rel: 'apple-touch-icon', sizes: '180x180', href: '/images/favicons/apple-icon-180x180.png' },
            { rel: 'apple-touch-icon', sizes: '192x192', href: '/images/favicons/android-icon-192x192.png' },
            { rel: 'manifest', href: '/manifest.json' }
        ]
    },

    env: {
        API_USERNAME: process.env.API_USERNAME,
        API_PASSWORD: process.env.API_PASSWORD,
        AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
        AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
        BUG_SNAG_API_KEY: process.env.BUG_SNAG_API_KEY,
        CART_TOKEN_SECRET: process.env.CART_TOKEN_SECRET,
        JWT_CLIENT_ID: process.env.JWT_CLIENT_ID,
        JWT_SERVER_SECRET: process.env.JWT_SERVER_SECRET,
        NODE_ENV: process.env.NODE_ENV
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
        '@nuxtjs/axios'
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
        vendor: ['vue-i18n'],

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
