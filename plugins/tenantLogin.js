// NOTE: this plugin must be rendered on the server because
// the TENANT_PASSWORD is being sent in clear text
export default async (context) => {

    const { data } = await context.$axios.$post('tenant/login', {
        id: process.env.TENANT_ID,
        password: process.env.TENANT_PASSWORD
    });

    context.store.dispatch('SET_JWT_TOKEN', data.authToken);
    context.store.dispatch('SET_JWT_REFRESH_TOKEN', data.refreshToken);

};
