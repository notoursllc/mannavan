const bcrypt = require('bcrypt');

// example usage:
// npm run hash --word=the_word_I_want_to_hash

bcrypt.genSalt(10, (err, salt) => {
    if (err) {
        console.log(err);
        return;
    }

    console.log(bcrypt.hashSync(process.env.npm_config_word, salt))
});
