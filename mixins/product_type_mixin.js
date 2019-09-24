export default {
    methods: {

        /*********************
         * Product Types
        /*********************/
        async getProductTypes() {
            const response = await this.$axios.$get('/product/types');
            return response.data;
        },


        async getProductType(id) {
            const response = await this.$axios.$get('/product/type', {
                params: {
                    id
                }
            });

            return response.data;
        },

        async upsertProductType(data) {
            let response;

            if(data.hasOwnProperty('id')) {
                response = await this.$axios.$put('/product/type', data);
            }
            else {
                response = await this.$axios.$post('/product/type', data);
            }

            return response.data;
        },

        async deleteProductType(id) {
            const response = await this.$axios.$delete('/product/type', {
                params: {
                    id
                }
            });

            return response.data;
        },


        /*********************
         * Product Sub Types
        /*********************/
        async getProductSubTypes() {
            const response = await this.$axios.$get('/product/subtypes');
            return response.data;
        },


        async getProductSubType(id) {
            const response = await this.$axios.$get('/product/subtype', {
                params: {
                    id
                }
            });

            return response.data;
        },

        async upsertProductSubType(data) {
            let response;

            if(data.hasOwnProperty('id')) {
                response = await this.$axios.$put('/product/subtype', data);
            }
            else {
                response = await this.$axios.$post('/product/subtype', data);
            }

            return response.data;
        },

        async deleteProductSubType(id) {
            const response = await this.$axios.$delete('/product/subtype', {
                params: {
                    id
                }
            });

            return response.data;
        },


        getNextAvailableTypeValue(allTypes) {
            let highestValue = 0;

            // find the highest value
            allTypes.forEach((obj) => {
                if(obj.value > highestValue) {
                    highestValue = obj.value;
                }
            });

            let factor = 0;

            if(highestValue) {
                factor = parseInt(Math.log(highestValue) / Math.log(2), 10); // current factor
                factor++; // what the new factor should be
            }

            return Math.pow(2, factor);
        },
    }
}
