import MasterTypes from '@/api/master_types';
import Products from '@/api/products';
import Vendors from '@/api/vendors';
import Storage from '@/api/storage';

export default ({$axios}, inject) => {
    $axios.defaults.auth = {
        username: process.env.API_USERNAME,
        password: process.env.API_PASSWORD
    };

    // Initialize API repositories
    const repositories = {
        masterTypes: MasterTypes($axios),
        products: Products($axios),
        vendors: Vendors($axios),
        storage: Storage($axios),
    };

    inject('api', repositories);
}
