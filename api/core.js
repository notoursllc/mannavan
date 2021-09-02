export default ($axios) => ({

    async appConfig() {
        const { data } = await $axios.$get('/app_config');
        return data;
    },

    contactUs(params) {
        return $axios.$post('/tenant/contactus', {
            ...params
        });
    },

});
