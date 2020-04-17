import isObject from 'lodash.isobject';
import MasterTypes from '@/api/master_types';
import Products from '@/api/products';
import Storage from '@/api/storage';


export default async ({$axios, store}, inject) => {

    async function loginOrRefresh(isRefresh) {
    // function loginOrRefresh(isRefresh) {
        let tokens;

        if(isRefresh) {
            tokens = await $axios.$post('tenant/refresh', {
                id: process.env.TENANT_ID,
                refresh_token: store.state.jwtRefreshToken // is this the right store.state path?
            });
        }
        else {
            tokens = await $axios.$post('tenant/login', {
                id: process.env.TENANT_ID,
                password: process.env.TENANT_PASSWORD
            });
        }

        $axios.setToken(tokens.data.authToken);

        // store.dispatch('SET_JWT_TOKEN', tokens.data.authToken);
        store.dispatch('SET_JWT_REFRESH_TOKEN', tokens.data.refreshToken);

        return tokens.data;
    }

    await loginOrRefresh();

    // One 401 (Authorization) error get a new JWT token
    $axios.onError(async (error) => {
        const originalRequest = error.config;
        const code = parseInt(error.response && error.response.status);

        if(code === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const tokens = await loginOrRefresh(true);

            if(!isObject(originalRequest.headers)) {
                originalRequest.headers = {};
            }
            originalRequest.headers.Authorization = tokens.authToken;

            // return originalRequest object with Axios.
            return $axios(originalRequest);
        }

        // TODO: send to error page instead?
        return Promise.reject(error);
    });


    // Initialize API repositories
    const repositories = {
        masterTypes: MasterTypes($axios),
        products: Products($axios),
        storage: Storage($axios)
    };

    inject('api', repositories);
};
