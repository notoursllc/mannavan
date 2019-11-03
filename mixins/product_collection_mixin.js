export default {
    methods: {

        async prodCollMix_list() {
            const response = await this.$axios.$get('/collections');
            return response.data;
        },


        async prodCollMix_get(id) {
            const response = await this.$axios.$get('/collection', {
                params: {
                    id
                }
            });

            return response.data;
        },

        async prodCollMix_upsert(data) {
            let response;

            if(data.hasOwnProperty('id')) {
                response = await this.$axios.$put('/collection', data);
            }
            else {
                response = await this.$axios.$post('/collection', data);
            }

            return response.data;
        },

        async prodCollMix_delete(id) {
            const response = await this.$axios.$delete('/collection', {
                params: {
                    id
                }
            });

            return response.data;
        }

    }
}
