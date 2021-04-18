export default ($axios) => ({

    async appConfig() {
        const { data } = await $axios.$get('/app_config');
        return data;
    }

});
