export default async ({ $axios, store }) => {

    let [ productTypes, productSubTypes ] = await Promise.all([
        $axios.$get('product/types'),
        $axios.$get('product/subtypes'),
    ]);

    store.dispatch('product/PRODUCT_TYPES', productTypes.data);
    store.dispatch('product/PRODUCT_SUBTYPES', productSubTypes.data);

}
