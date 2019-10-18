export default {
    methods: {
        async fitmix_list() {
            const response = await this.$axios.$get('/fits');
            return response.data;
        },


        async fitmix_get(id) {
            const response = await this.$axios.$get('/fit', {
                params: {
                    id
                }
            });

            return response.data;
        },

        async fitmix_upsert(data) {
            let response;

            if(data.hasOwnProperty('id')) {
                response = await this.$axios.$put('/fit', data);
            }
            else {
                response = await this.$axios.$post('/fit', data);
            }

            return response.data;
        },

        async fitmix_delete(id) {
            const response = await this.$axios.$delete('/fit', {
                params: {
                    id
                }
            });

            return response.data;
        }
    }
}
