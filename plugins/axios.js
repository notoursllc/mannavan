import isObject from 'lodash.isobject';

export default (context) => {

    context.$axios.setToken(context.store.state.jwtToken);

    context.$axios.onError(async (error) => {
        const originalRequest = error.config;
        const code = parseInt(error.response && error.response.status);

        // On 401 (Authorization) error get a new JWT token
        if(code === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const { data } = await context.$axios.$post('tenant/refresh', {
                id: process.env.TENANT_ID,
                refresh_token: context.store.state.jwtRefreshToken
            });

            context.store.dispatch('SET_JWT_TOKEN', data.authToken);
            context.store.dispatch('SET_JWT_REFRESH_TOKEN', data.refreshToken);


            if(!isObject(originalRequest.headers)) {
                originalRequest.headers = {};
            }
            originalRequest.headers.Authorization = data.authToken;

            // return originalRequest object with Axios.
            return context.$axios(originalRequest);
        }

        // TODO: send to error page instead?
        return Promise.reject(error);
    });

};
