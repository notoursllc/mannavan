const OFF = 0;
const WARN = 1;
const ERROR = 2;

module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  parserOptions: {
    parser: 'babel-eslint'
  },
  extends: [
    '@nuxtjs',
    'plugin:nuxt/recommended'
  ],
  // add your custom rules here
  rules: {
    'array-bracket-spacing': OFF,
    'arrow-parens': OFF,
    'block-spacing': [ WARN, 'always' ],
    'brace-style': [ ERROR, 'stroustrup', { 'allowSingleLine': false } ],
    'block-scoped-var': ERROR,
    'camelcase': OFF,
    'comma-dangle': [ERROR, {
        'arrays': 'never',
        'objects': 'never',
        'imports': 'never',
        'exports': 'never',
        'functions': 'ignore',
    }],
    'comma-spacing': [ ERROR, { 'before': false, 'after': true } ],
    'computed-property-spacing': [ WARN, 'never' ],
    'curly': ERROR,
    'dot-location': [ ERROR, 'property' ],  // the dot goes with the property when doing multiline
    'eol-last': OFF,
    'eqeqeq': [ ERROR, 'smart' ],
    'func-names': OFF,
    'import/order': OFF,
    'indent': [ERROR, 4, { 'SwitchCase': 1 }],
    'key-spacing': [ ERROR, { 'beforeColon': false, 'afterColon': true } ],
    // 'keyword-spacing': [ WARN, { 'before': true, 'after': false } ],
    'keyword-spacing': OFF,
    'linebreak-style': [ERROR, 'unix'],
    'lines-around-comment': [ ERROR, { 'beforeBlockComment': true } ],
    'new-cap': ERROR,
    'no-alert': ERROR,
    'no-array-constructor': ERROR,
    'no-console': WARN,
    'no-eval': ERROR,
    'no-inline-comments': OFF,
    'no-mixed-spaces-and-tabs': ERROR,
    'no-multiple-empty-lines': OFF,
    'no-new-object': ERROR,
    'no-plusplus': OFF,
    'no-spaced-func': ERROR,
    'no-ternary': OFF,
    'no-undefined': OFF,
    'no-unused-vars': WARN,
    'no-use-before-define': [ERROR, {
        'functions': false,
        'classes': true
    }],
    'nuxt/no-cjs-in-config': OFF,
    'object-curly-spacing': OFF,
    'object-shorthand': OFF,
    'one-var': OFF,
    'operator-linebreak': OFF,
    'padded-blocks': OFF,
    'quotes': [ERROR, 'single'],
    'semi': [ ERROR, 'always' ],
    'semi-spacing': [ ERROR, {'before': false, 'after': true}],
    'space-before-blocks': [ ERROR, 'always' ],
    'space-before-function-paren': OFF,
    'vars-on-top': OFF,
    'vue/attribute-hyphenation': OFF,
    'vue/attributes-order': OFF,
    'vue/html-closing-bracket-newline': OFF,
    'vue/html-indent': [WARN, 4, {
        'attribute': 1,
        'baseIndent': 1,
        'closeBracket': 0,
        'alignAttributesVertically': true,
        'ignores': []
    }],
    'vue/html-self-closing': [WARN, {
        'html': {
            'void': 'never',
            'normal': 'any',
            'component': 'any'
        },
        'svg': 'always',
        'math': 'always'
    }],
    'vue/max-attributes-per-line': OFF,
    'vue/multiline-html-element-content-newline': OFF,
    'vue/singleline-html-element-content-newline': OFF,
    'wrap-iife': [ ERROR, 'outside' ],
    'no-undefined': OFF,
    'unicorn/prefer-exponentiation-operator': OFF,
    'unicorn/prefer-includes': OFF
  }
}
