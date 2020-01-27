import MasterTypes from '@/api/master_types';
import Products from '@/api/products';
import Storage from '@/api/storage';

export default ({$axios}, inject) => {
    $axios.defaults.auth = {
        username: process.env.API_USERNAME,
        password: process.env.API_PASSWORD
    };

    $axios.defaults.headers.common = {
        'X-Tenant': process.env.TENANT_ID
    };

    // Initialize API repositories
    const repositories = {
        masterTypes: MasterTypes($axios),
        products: Products($axios),
        storage: Storage($axios),
    };

    inject('api', repositories);
}
