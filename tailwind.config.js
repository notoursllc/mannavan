// https://tailwindcss.nuxtjs.org/tailwind-config/#default-configuration
const figleafTailwindConfig = require('@notoursllc/figleaf/tailwind.config.js');

// Add our own paths:
figleafTailwindConfig.purge.content.push(
    'components/**/*.vue', // this is already defined in figleaf
    'layouts/**/*.vue',
    'pages/**/*.vue',
    'plugins/**/*.js',
    'nuxt.config.js'
    // TypeScript
    // 'plugins/**/*.ts',
    // 'nuxt.config.ts'
);

module.exports = Object.assign({}, figleafTailwindConfig);
