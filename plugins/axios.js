export default (context) => {

    const encodedToken = Buffer.from(`${context.$config.tenantId}:${context.$config.tenantApiKey}`).toString('base64');
    context.$axios.setHeader('Authorization', `Basic ${encodedToken}`);

    /*
    context.$axios.onError(async (error) => {

    });
    */

};
