// https://tailwindcss.nuxtjs.org/tailwind-config/#default-configuration
const figleafTailwindConfig = require('@notoursllc/figleaf/tailwind.config.js');

// figleafTailwindConfig.purge.enabled = true;

// Add our own paths:
figleafTailwindConfig.purge.content.push(
    'components/**/*.vue',
    'layouts/**/*.vue',
    'pages/**/*.vue',
    'plugins/**/*.js',
    'nuxt.config.js',
    'node_modules/@notoursllc/figleaf/components/**/*.vue',
    'node_modules/@notoursllc/figleaf/layouts/**/*.vue'
);

figleafTailwindConfig.jit = true;
figleafTailwindConfig.exposeConfig = false; // https://tailwindcss.nuxtjs.org/options/#exposeconfig

module.exports = Object.assign({}, figleafTailwindConfig);
