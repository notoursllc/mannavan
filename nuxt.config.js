const isDev = process.env.NODE_ENV === 'development';

if(isDev) {
    require('dotenv').config();
}

module.exports = {
    // mode: 'universal',
    mode: 'spa',

    vue: {
        config: {
            productionTip: true,
            devtools: isDev
        }
    },

    publicRuntimeConfig: {
        axios: {
            browserBaseURL: process.env.API_URL
        },
        cookieSecure: process.env.COOKIE_SECURE || false,
        domainName: process.env.DOMAIN_NAME,
        emailInfo: process.env.EMAIL_INFO,

        nodeEnv: process.env.NODE_ENV,
        nodeEnvIsDev: isDev,
        nodeEnvIsProd: process.env.NODE_ENV === 'production',

        shippingFromAddress1: process.env.SHIPPING_ADDRESS_FROM_ADDRESS1,
        shippingFromCity: process.env.SHIPPING_ADDRESS_FROM_CITY,
        shippingFromCompany: process.env.SHIPPING_ADDRESS_FROM_COMPANY,
        shippingFromCountryCode: process.env.SHIPPING_ADDRESS_FROM_COUNTRY_CODE,
        shippingFromPhone: process.env.SHIPPING_ADDRESS_FROM_PHONE,
        shippingFromState: process.env.SHIPPING_ADDRESS_FROM_STATE,
        shippingFromZip: process.env.SHIPPING_ADDRESS_FROM_ZIP,

        // this needs to be public because it's used by axios plugin
        tenantId: process.env.TENANT_ID,
        tenantApiKey: process.env.TENANT_API_KEY
    },

    privateRuntimeConfig: {
        bugSnagApiKey: process.env.BUG_SNAG_API_KEY
    },

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
            { rel: 'icon', type: 'image/x-icon', href: '/images/favicon.ico' },
            { rel: 'preconnect', href: '//pcdn.piiojs.com' },
            {
                rel: 'preload',
                as: 'script',
                href: `//pcdn.piiojs.com/${process.env.PIIO_DOMAIN_KEY}/image.min.js`
            }
        ],
        script: [
            // NOTE: Putting this in the head() of the cart/checkout/index.vue file, instead of here,
            // causes this to be loaded only for that route.  That's a good thing, but it caused a race
            // condition resulting in a javascript error: SqPaymentForm is not defined
            // That's because the CheckoutSectionPayment component, which uses SqPaymentForm, sometimes
            // loads before the head() script is loaded.
            // Putting it here doesn't seem ideal, but it's safest.
            {
                src: isDev ? 'https://js.squareupsandbox.com/v2/paymentform' : 'https://js.squareup.com/v2/paymentform',
                body: true,
                async: true
            },
            {
                hid: 'piio-init',
                innerHTML: `(function(i,m,a,g,e) {e = i.getElementsByTagName(m)[0], (g = i.createElement(m)).src = "//pcdn.piiojs.com/"+a+"/image.min.js",g.onerror = function() {(g = i.createElement(m)).src = "https://fs.piio.co/image-failover.min.js",e.parentNode.insertBefore(g, e);}, e.parentNode.insertBefore(g, e);}(document, "script", "${process.env.PIIO_DOMAIN_KEY}"));`,
                type: 'text/javascript',
                pbody: true
            }
        ],

        // disabling the HTML sanitizer for the piio-init script (innerHTML vaule)
        __dangerouslyDisableSanitizersByTagID: {
            'piio-init': ['innerHTML']
        }
    },

    telemetry: false,

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
        { src: '@/plugins/bugsnag', mode: 'server' },
        '@/plugins/axios.js',
        // '@/plugins/api.js',
        { src: '@/plugins/api.js', ssr: true },
        '@/plugins/i18n.js',
        '@/plugins/element-ui',
        '@/plugins/global-properties',
        '@/plugins/vuelidate',
        '@/plugins/format8601',
        '@/plugins/prettyJson',
        '@/plugins/figIcon.js',
        '@/plugins/directives.js',
        // '@/plugins/vue-placeholders.js',
        // '@/plugins/vue-observe-visibility.client.js',
        { src: '@/plugins/piio/piio.js', ssr: false },
        { src: '@/plugins/youtube', ssr: false },
        { src: '@/plugins/paypal-button/paypal-button.js', ssr: false }
    ],

    buildModules: [
        '@nuxtjs/tailwindcss'
    ],

    tailwindcss: {
        cssPath: '@/node_modules/@notoursllc/figleaf/assets/css/tailwind.css',
        configPath: 'tailwind.config.js',
        exposeConfig: false // https://tailwindcss.nuxtjs.org/options/#exposeconfig
    },

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
        '@nuxt/image',
        'cookie-universal-nuxt',
        ['@nuxtjs/pwa', { oneSignal: false }]
    ],

    /*
    ** Axios module configuration
    *  See https://github.com/nuxt-community/axios-module#options
    */
    axios: {
        debug: false,
        // retry: { retries: 3 },
        progress: true
    },

    /**
     *  Build configuration
     */
    build: {
        // analyze: true,
        transpile: [
            /^element-ui/
        ],

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
};
