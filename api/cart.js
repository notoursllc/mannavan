import queryString from 'query-string';
import isObject from 'lodash.isobject';


export default ($axios) => ({

    upsert(params) {
        return $axios.$post('/cart/upsert', params);
    },

    // async deleteImage(url) {
    //     const { data } = await $axios.$delete('/storage/image', {
    //         params: {
    //             url
    //         }
    //     });

    //     return data;
    // }

});
