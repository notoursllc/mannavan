export default {
    methods: {
        async matmix_list() {
            const response = await this.$axios.$get('/materials');
            return response.data;
        },

        async matmix_get(id) {
            const response = await this.$axios.$get('/material', {
                params: {
                    id
                }
            });

            return response.data;
        },

        async matmix_upsert(data) {
            let response;

            if(data.hasOwnProperty('id')) {
                response = await this.$axios.$put('/material', data);
            }
            else {
                response = await this.$axios.$post('/material', data);
            }

            return response.data;
        },

        async matmix_delete(id) {
            const response = await this.$axios.$delete('/material', {
                params: {
                    id
                }
            });

            return response.data;
        }
    }
}
