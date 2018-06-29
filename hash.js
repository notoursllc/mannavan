const bcrypt = require('bcrypt');

// example usage:
// npm run hash --word=the_word_I_want_to_hash

const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync(process.env.npm_config_word, salt);

// Escaping the $ characters, otherwise adding a an environment variable
// in nanobox will not work:  nanobox evar add local FOO=somevalue
// console.log(hash.replace('$', '\\$', ))
console.log("HASH", hash);
console.log("ESCAPED HASH", hash.replace(/\$/g, '\\$', ))
