import isObject from 'lodash.isobject';
import cloneDeep from 'lodash.clonedeep';

export default ($axios) => ({

    async list(object) {
        const { data } = await $axios.$get('/product_option_sets', {
            params: {
                object
            }
        });
        return data;
    },


    async get(id) {
        const response = await $axios.$get('/product_option_set', {
            params: {
                id
            }
        });

        return response.data;
    },


    async upsert(data) {
        let response;

        if(!isObject(data)) {
            return;
        }

        // remove empty values from option_values
        let d = cloneDeep(data);
        if(Array.isArray(d.option_values)) {
            d.option_values = d.option_values.filter(val => val && val.trim())
        }

        delete d.created_at;
        delete d.updated_at;

        if(data.hasOwnProperty('id')) {
            response = await $axios.$put('/product_option_set', d);
        }
        else {
            response = await $axios.$post('/product_option_set', d);
        }

        return response.data;
    },


    async delete(id) {
        const response = await $axios.$delete('/product_option_set', {
            params: {
                id
            }
        });

        return response.data;
    }
})
