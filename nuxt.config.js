require('dotenv').config();  // TODO: not sure if this works here

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
            { hid: 'description', name: 'description', content: pkg.description }
        ],
        link: [
            { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
        ]
    },


    env: {
        BUG_SNAG_API_KEY: process.env.BUG_SNAG_API_KEY,
        AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
        AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
        NODE_ENV: process.env.NODE_ENV,
        COOKIE_DOMAIN: process.env.COOKIE_DOMAIN,
    },

    /*
    ** Customize the progress-bar color
    */
    loading: {
        color: '#f7c64d',
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
        // '@/plugins/axios'
        // { src: '@/plugins/localStorage.js', ssr: false }  //https://www.npmjs.com/package/vuex-persistedstate
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
