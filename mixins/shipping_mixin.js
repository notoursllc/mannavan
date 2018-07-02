'use strict';

import queryString from 'query-string';


export default {
    methods: {
        // goToProductDetails(seo_uri, productTypeName) {
        //     this.$router.push({
        //         name: 'type-name-seouri',
        //         params: { name: productTypeName, seouri: seo_uri }
        //     });
        // },


        // goToAdminProductDetails(id) {
        //     this.$router.push({
        //         name: 'acts-product-id',
        //         params: { id }
        //     });
        // },


        // goToAdminProductUpsert(productId) {
        //     this.$router.push({
        //         name: 'acts-product-upsert-id',
        //         params: { id: productId }
        //     });
        // },


        // goToAdminProductAdd() {
        //     this.$router.push({
        //         name: 'acts-product-upsert-id'
        //     });
        // },


        // goToAdminProductList() {
        //     this.$router.push({
        //         name: 'acts-product-list'
        //     });
        // },


        async getPackageTypes(params) {
            let paramString = queryString.stringify(params, {arrayFormat: 'bracket'});

            const response = await this.$axios.$get(`/shipping/packagetypes?${paramString}`); // TODO: is there a XSS issue here?
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


        async deleteProductSize(id) {
            const response = await this.$axios.$delete(`/shipping/packagetype`, { id })
            return response.data;
        }
    }
}
