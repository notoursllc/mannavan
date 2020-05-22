export default async ({ $axios, store }) => {

    const [ productTypes, productSubTypes ] = await Promise.all([
        $axios.$get('master_types?object=product_type'),
        $axios.$get('master_types?object=product_sub_type')
    ]);

    store.dispatch('product/PRODUCT_TYPES', productTypes.data);
    store.dispatch('product/PRODUCT_SUBTYPES', productSubTypes.data);

};
