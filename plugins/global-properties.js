// import queryString from 'query-string';

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

    const promises = [
        ctx.app.$api.masterTypes.all({
            where: ['object', '=', 'product_type']
        }),
        ctx.app.$api.masterTypes.all({
            where: ['object', '=', 'product_sub_type']
        }),
        ctx.app.$api.productAccentMessages.all()
    ];

    if(ctx.store.state.cart.id) {
        promises.push(
            ctx.app.$api.cart.get(ctx.store.state.cart.id)
        );
    }

    const [ productTypes, productSubTypes, productAccentMessages, shoppingCart ] = await Promise.all(promises);

    ctx.store.dispatch('product/PRODUCT_TYPES', productTypes);
    ctx.store.dispatch('product/PRODUCT_SUBTYPES', productSubTypes);
    ctx.store.dispatch('product/PRODUCT_SKU_ACCENT_MESSAGES', productAccentMessages);
    ctx.store.dispatch('cart/CART', shoppingCart);
};
