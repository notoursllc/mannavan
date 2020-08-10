import queryString from 'query-string';

export default ($http) => ({

    async all(params) {
        const paramString = queryString.stringify(params, {arrayFormat: 'bracket'});
        const { data } = await $http.$get(`/master_types/all?${paramString}`); // TODO: is there a XSS issue here?
        return data;
    },

    async list(params) {
        const paramString = queryString.stringify(params, {arrayFormat: 'bracket'});
        const { data } = await $http.$get(`/master_types?${paramString}`); // TODO: is there a XSS issue here?
        return data;
    },


    async get(id) {
        const response = await $http.$get('/master_type', {
            searchParams: {
                id
            }
        });

        return response.data;
    }

});
