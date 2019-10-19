'use strict';

import queryString from 'query-string';
import isObject from 'lodash.isobject';


export default {
    methods: {
        async shipmix_getPackageTypes(params) {
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
            let response;

            if(packageType.id) {
                response = await this.$axios.$put('/shipping/packagetype', packageType);
            }
            else {
                response = await this.$axios.$post('/shipping/packagetype', packageType);
            }

            return response.data;
        },


        async deletePackageType(id) {
            const response = await this.$axios.$delete('/shipping/packagetype', {
                params: { id }
            });
            return response.data;
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
