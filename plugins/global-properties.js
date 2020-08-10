import queryString from 'query-string';

// export default async ({ $axios, store }) => {
export default async (ctx) => {
    // const productTypeParams = queryString.stringify(
    //     { where: ['object', '=', 'product_type'] },
    //     { arrayFormat: 'bracket' }
    // );

    // const [ productTypes, productSubTypes ] = await Promise.all([
    //     $axios.$get('master_types?object=product_type'),
    //     $axios.$get('master_types?object=product_sub_type')
    // ]);

    const [ productTypes, productSubTypes ] = await Promise.all([
        ctx.app.$api.masterTypes.all({
            where: ['object', '=', 'product_type']
        }),
        ctx.app.$api.masterTypes.all({
            where: ['object', '=', 'product_sub_type']
        })
    ]);

    ctx.store.dispatch('product/PRODUCT_TYPES', productTypes.data);
    ctx.store.dispatch('product/PRODUCT_SUBTYPES', productSubTypes.data);

};
