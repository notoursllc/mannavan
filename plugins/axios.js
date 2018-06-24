'use strict';

export default ({$axios}) => {
    $axios.defaults.auth = {
        username: process.env.API_USERNAME,
        password: process.env.API_PASSWORD
    }
}
