// Enable this plugin in nuxt.config.js if you want to sets up
// basic authentication in axios, thus axios will send the
// "Authentication: Basic xyz.." header with each request
export default ({$axios}) => {
    $axios.defaults.auth = {
        username: process.env.API_USERNAME,
        password: process.env.API_PASSWORD
    }
}
