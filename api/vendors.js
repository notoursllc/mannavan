export default ($axios) => ({

    // async list(object) {
    //     const { data } = await $axios.$get('/vendors', {
    //         params: {
    //             ...object
    //         }
    //     });
    //     return data;
    // },

    async list() {
        const { data } = await $axios.$get('/vendors');
        return data;
    },


    async get(id) {
        const response = await $axios.$get('/vendor', {
            params: {
                id
            }
        });

        return response.data;
    },


    async upsert(data) {
        let response;

        if(data.hasOwnProperty('id')) {
            response = await $axios.$put('/vendor', data);
        }
        else {
            response = await $axios.$post('/vendor', data);
        }

        return response.data;
    },


    async delete(id) {
        const response = await $axios.$delete('/vendor', {
            params: {
                id
            }
        });

        return response.data;
    }
})
