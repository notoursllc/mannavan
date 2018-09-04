// NOTE:
// This is a direct copy of node_modules/hapi-nuxt/src/index.js,
// however that file currently hard-codes "require('nuxt')", which
// does not allow me to use nuxt-edge:
// https://github.com/nuxt-community/hapi-nuxt/issues/14
// This plugin should be removed in favor of the official hapi-nuxt plugin
// once that bug is fixed

const { resolve } = require('path')
const { Nuxt, Builder } = require('nuxt-edge')

const NuxtPlugin = {

    name: 'nuxt',

    pkg: require('./package.json'),

    async register (server, config) {

        // If config is not provided try nuxt.config.js
        if (!config || Object.keys(config).length === 0) {
            config = 'nuxt.config.js'
        }

        // Resolve config location if is provided as string
        if(typeof config === 'string') {
            try {
                const path = resolve(process.cwd(), config)
                config = require(path)
            } catch (e) {
                // DO NOTHING
            }
        }

        // Create nuxt instance using options
        const nuxt = new Nuxt(config)
        server.expose('nuxt', nuxt)

        // Nuxt handler
        server.route({
            method: 'GET',
            path: '/{path*}',
            config: {
                id: 'NuxtController.render',
                auth: false,
            },
            handler (request, h) {
                const {req, res} = request.raw

                nuxt.render(req, res)

                // https://hapijs.com/api#h.abandon
                return h.abandon
            }
        })

        // Dev
        if (nuxt.options.dev && nuxt.options.startOnly !== false) {
            // Build nuxt
            console.log('Building nuxt ...')
            const builder = new Builder(nuxt);
            server.expose('builder', builder);
            builder.build().catch(console.error)
        }
    }
}

module.exports = NuxtPlugin
