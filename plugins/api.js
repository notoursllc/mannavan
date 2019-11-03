import MasterTypes from '@/api/master_types';

export default ({$axios}, inject) => {
    $axios.defaults.auth = {
        username: process.env.API_USERNAME,
        password: process.env.API_PASSWORD
    };

    // Initialize API repositories
    const repositories = {
        masterTypes: MasterTypes($axios),
    };

    inject('api', repositories);
}
