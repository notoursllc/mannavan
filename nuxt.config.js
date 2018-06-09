// require('dotenv').config();  // TODO: not sure if this works here

const pkg = require('./package');

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
        BUG_SNAG_API_KEY: process.env.BUG_SNAG_API_KEY,
        AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
        AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
        NODE_ENV: process.env.NODE_ENV,
        JWT_CLIENT_ID: process.env.JWT_CLIENT_ID,
        JWT_SERVER_SECRET: process.env.JWT_SERVER_SECRET,
        CART_TOKEN_SECRET: process.env.CART_TOKEN_SECRET
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
        { src: '@/plugins/cart-token.js', ssr: false },
        '@/plugins/i18n.js',
        '@/plugins/element-ui',
        '@/plugins/format8601',
        '@/plugins/prettyJson',
        '@/plugins/promise-finally',
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
        // Doc: https://github.com/nuxt-community/axios-module#usage
        '@nuxtjs/axios'
    ],

    /*
    ** Axios module configuration
    *  See https://github.com/nuxt-community/axios-module#options
    */
    axios: {
        baseURL: process.env.API_URL || 'http://localhost:3000/api/v1',
        debug: process.env.API_DEBUG || false,
        https: process.env.API_USE_HTTPS || true,
        retry: { retries: 3 },
        progress: true
    },

    /**
     *  Build configuration
     */
    build: {
        vendor: ['vue-i18n'],

        /*
        ** You can extend webpack config here
        */
        extend(config, ctx) {
            // Run ESLint on save
            if (ctx.isDev && ctx.isClient) {
                config.module.rules.push({
                    enforce: 'pre',
                    test: /\.(js|vue)$/,
                    loader: 'eslint-loader',
                    exclude: /(node_modules)/
                })
            }
        }
    },

    transition: {
        name: 'fade',
        mode: 'out-in'
    }
}
