
export default ($axios) => ({

    async addImage(FormData) {
        const { data } = await $axios.$post('/storage/image', FormData);
        return data;
    },

    async deleteImage(url) {
        const { data } = await $axios.$delete('/storage/image', {
            params: {
                url
            }
        });

        return data;
    }

});
