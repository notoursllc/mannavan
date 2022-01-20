// https://tailwindcss.nuxtjs.org/tailwind-config/#default-configuration
const figleafTailwindConfig = require('@notoursllc/figleaf/tailwind.config.js');

// Add our own paths:
figleafTailwindConfig.content.push(
    './components/**/*.{js,vue}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.js',
    './nuxt.config.js',
    'node_modules/@notoursllc/figleaf/components/**/*.{js,vue}',
    'node_modules/@notoursllc/figleaf/layouts/**/*.vue'
);

module.exports = Object.assign({}, figleafTailwindConfig);
