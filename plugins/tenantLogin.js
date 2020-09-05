// NOTE: this plugin must be rendered on the server because
// the TENANT_PASSWORD is being sent in clear text
export default async (context) => {

    const response = await context.$axios.post('tenant/login', {
        id: context.$config.tenantId,
        password: context.$config.tenantPassword
    });

    const [cookie] = response.headers['set-cookie'];

    context.app.$cookies.set(
        'bvrt',
        context.app.$cookies.nodeCookie.parse(cookie).bvrt,
        {
            httpOnly: true,
            sameSite: false,
            secure: context.$config.nodeEnvIsProd,
            path: '/',
            maxAge: 60 * 60 * 24 // seconds
        }
    );

    const data = response.data.data;

    context.store.dispatch('SET_JWT_TOKEN', data.authToken);

};
