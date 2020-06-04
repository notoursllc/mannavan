// NOTE: this plugin must be rendered on the server because
// the TENANT_PASSWORD is being sent in clear text
export default async (context) => {

    const response = await context.$axios.post('tenant/login', {
        id: process.env.TENANT_ID,
        password: process.env.TENANT_PASSWORD
    });

    context.app.$cookies.set(
        'bvrt',
        context.app.$cookies.nodeCookie.parse(response.headers['set-cookie'][0]).bvrt,
        {
            httpOnly: true,
            sameSite: false,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: 60 * 60 * 24 // seconds
        }
    );

    const data = response.data.data;

    context.store.dispatch('SET_JWT_TOKEN', data.authToken);
    context.store.dispatch('SET_JWT_REFRESH_TOKEN', data.refreshToken);

};
