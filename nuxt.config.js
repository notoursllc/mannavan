const isDev = process.env.NODE_ENV === 'development';

if(isDev) {
    require('dotenv').config();
}

module.exports = {
    mode: 'universal',

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
        bugSnagApiKey: process.env.BUG_SNAG_API_KEY,
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
        tenantApiKey: process.env.TENANT_API_KEY,

        stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
        stripeAccount: process.env.STRIPE_ACCOUNT,
        stripeApiVersion: process.env.STRIPE_API_VERSION,
        locale: process.env.LOCALE
    },

    // privateRuntimeConfig: {
    //     bugSnagApiKey: process.env.BUG_SNAG_API_KEY
    // },

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
            {
                src: 'https://js.stripe.com/v3/',
                body: true,
                async: false
            }

            // NOTE: Putting this in the head() of the cart/checkout/index.vue file, instead of here,
            // causes this to be loaded only for that route.  That's a good thing, but it caused a race
            // condition resulting in a javascript error: SqPaymentForm is not defined
            // That's because the CheckoutSectionPayment component, which uses SqPaymentForm, sometimes
            // loads before the head() script is loaded.
            // Putting it here doesn't seem ideal, but it's safest.
            // {
            //     src: isDev ? 'https://js.squareupsandbox.com/v2/paymentform' : 'https://js.squareup.com/v2/paymentform',
            //     body: true,
            //     async: true
            // }
        ]
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
        '@/assets/css/base.scss',
        '@/assets/css/base.css'
    ],

    /*
    ** Plugins to load before mounting the App
    */
    plugins: [
        // { src: '@/plugins/bugsnag', mode: 'server' },
        '@/plugins/bugsnag',
        '@/plugins/axios.js',
        { src: '@/plugins/api.js', ssr: true },
        '@/plugins/confirm.js',
        '@/plugins/i18n.js',
        '@/plugins/global-properties',
        '@/plugins/vuelidate',
        '@/plugins/format8601',
        '@/plugins/persistedState.client.js',
        '@/plugins/prettyJson',
        '@/plugins/figIcon.js',
        '@/plugins/directives.js',
        '@/plugins/filters.js',
        '@/node_modules/@notoursllc/figleaf/components/toaster',
        '@/node_modules/@notoursllc/figleaf/components/confirm',
        // '@/plugins/vue-placeholders.js',
        // '@/plugins/vue-observe-visibility.client.js',
        // { src: '@/plugins/youtube', ssr: false },
        { src: '@/plugins/paypal-button/paypal-button.js', ssr: false }

    ],

    buildModules: [
        '@nuxtjs/tailwindcss',
        '@nuxt/image'
    ],

    // Nuxt image config
    // https://image.nuxtjs.org/api/options/
    image: {
        domains: [
            'https://gmnst-assets.nyc3.digitaloceanspaces.com'
        ],
        staticFilename: '[publicPath]/images/[name]-[hash][ext]',
        // The screen sizes predefined by `@nuxt/image`:
        screens: {
            xs: 320,
            sm: 640,
            md: 768,
            lg: 1024,
            xl: 1280,
            xxl: 1536,
            '2xl': 1536
        },
        presets: {
            prod_thumb: {
                modifiers: {
                    format: 'jpg',
                    width: 75,
                    height: 75
                }
            },
            prod_thumb_xs: {
                modifiers: {
                    format: 'jpg',
                    width: 45,
                    height: 45
                }
            }
        }
    },

    tailwindcss: {
        cssPath: '@/node_modules/@notoursllc/figleaf/assets/css/tailwind.css'
    },

    router: {
        middleware: [
            'store-dispatch'
        ]
    },

    /*
    ** Nuxt.js modules
    */
    modules: [
        // Doc: https://axios.nuxtjs.org/usage
        '@nuxtjs/axios',
        'cookie-universal-nuxt',
        ['@nuxtjs/pwa', { oneSignal: false }],
        '@nuxt/image'
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
        transpile: [
            // Figleaf modules are written in ES6 javascript (using export/import)
            // which a node server does not understand.   Since we are using nuxt in
            // ssr mode (thus using a node server), the figleaf code needs to be transpiled,
            // otherwise we will get an error "Unexpected token export"
            '@notoursllc/figleaf'
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
