import isObject from 'lodash.isobject';

export default (context) => {

    context.$axios.setToken(context.store.state.jwtToken);

    context.$axios.onError(async (error) => {
        const originalRequest = error.config;
        const code = parseInt(error.response && error.response.status);

        // On 401 (Authorization) error get a new JWT token
        if(code === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            // console.log("REFRESH TOKEN", context.app.$cookies.get('token'));

            // const { data } = await context.$axios.$post(
            const response = await context.$axios.$post(
                'tenant/refresh',
                {
                    id: process.env.TENANT_ID
                },
                {
                    withCredentials: true
                }
            );

            context.store.dispatch('SET_JWT_TOKEN', response.data.authToken);

            if(!isObject(originalRequest.headers)) {
                originalRequest.headers = {};
            }
            originalRequest.headers.Authorization = response.data.authToken;

            // return originalRequest object with Axios.
            return context.$axios(originalRequest);
        }

        // TODO: send to error page instead?
        return Promise.reject(error);
    });

};
