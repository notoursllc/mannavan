export default {
    methods: {
        async optmix_search() {
            const response = await this.$axios.$get('/options', {
                params: {
                    id
                }
            });
            return response.data;
        },


        async optmix_get(id) {
            const response = await this.$axios.$get('/option', {
                params: {
                    id
                }
            });

            return response.data;
        },


        async optmix_upsert(data) {
            let response;

            if(data.id) {
                response = await this.$axios.$put('/option', data);
            }
            else {
                response = await this.$axios.$post('/option', data);
            }

            return response.data;
        },


        async optmix_delete(id) {
            const response = await this.$axios.$delete('/option', {
                params: {
                    id
                }
            });

            return response.data;
        }
    }
}
