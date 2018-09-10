'use strict';

import queryString from 'query-string';
import isObject from 'lodash.isobject';


export default {
    methods: {
        async getPackageTypes(params) {
            let paramString = queryString.stringify(params, {arrayFormat: 'bracket'});

            const response = await this.$axios.$get(`/shipping/packagetypes?${paramString}`); // TODO: is there a XSS issue here?
            return response.data;
        },

        async getPackageTypeById(id, options) {
            let params = {};

            if(isObject(options)) {
                params = {
                    ...options
                };
            }

            params.id = id;

            const response = await this.$axios.$get('/shipping/packagetype', {
                params
            });
            return response.data;
        },


        async upsertPackageType(packageType) {
            let uri = '/shipping/packagetype/create' ;

            if(packageType.id) {
                uri = '/shipping/packagetype/update';
            }

            const response = await this.$axios.$post(uri, packageType);
            return response.data;
        },


        async deletePackageType(id) {
            console.log("DEL", id)
            const response = await this.$axios.$delete('/shipping/packagetype', {
                params: { id }
            });
            return response.data;
        },


        async getShippingLabel(id) {
            try {
                const response = await this.$axios.$post('/shipping/label', { id });
                return response.data;
            }
            catch(err) {
                console.error(err)
            }
        },


        goToPackageTypeList() {
            this.$router.push({
                name: 'acts-shipping-packagetypes-list'
            });
        },


        goToPackageTypeUpsert(id) {
            this.$router.push({
                name: 'acts-shipping-packagetypes-upsert-id',
                params: { id: id }
            });
        },

        getShippingParcelDistanceUnits() {
            return [
                'cm',
                'in',
                'ft',
                'mm',
                'm',
                'yd'
            ]
        },

        getShippingParcelMassUnits() {
            return [
                'g',
                'oz',
                'lb',
                'kg'
            ]
        }
    }
}
