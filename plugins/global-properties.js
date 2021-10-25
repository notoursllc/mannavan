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
        ctx.app.$api.masterType.all({
            where: ['object', '=', 'product_type'],
            sortBy: 'ordinal',
            sortDesc: false
        }),
        ctx.app.$api.masterType.all({
            where: ['object', '=', 'product_sub_type'],
            sortBy: 'ordinal',
            sortDesc: false
        }),
        ctx.app.$api.product.accentMessage.all(),
        ctx.app.$api.appConfig()
    ];

    if(ctx.store.state.cart.id) {
        promises.push(
            ctx.app.$api.cart.get({
                id: ctx.store.state.cart.id,
                relations: true
            })
        );
    }

    const [ productTypes, productSubTypes, productAccentMessages, appConfig, shoppingCart ] = await Promise.all(promises);

    ctx.store.dispatch('product/PRODUCT_TYPES', productTypes?.data);
    ctx.store.dispatch('product/PRODUCT_SUBTYPES', productSubTypes?.data);
    ctx.store.dispatch('product/PRODUCT_SKU_ACCENT_MESSAGES', productAccentMessages?.data);
    ctx.store.dispatch('ui/APP_CONFIG', appConfig?.data);

    if(!ctx.store.state.cart.id || !shoppingCart?.data) {
        ctx.store.dispatch('cart/CART_RESET');
    }
    else {
        ctx.store.dispatch('cart/CART', shoppingCart?.data);
    }
};
