import isObject from 'lodash.isobject';

export default async (ctx) => {
    const promises = [
        ctx.app.$api.masterType.list({
            object: 'product_type',
            published: true,
            _sort: 'ordinal:asc'
        }),
        ctx.app.$api.masterType.list({
            object: 'product_sub_type',
            published: true,
            _sort: 'ordinal:asc'
        }),
        ctx.app.$api.product.accentMessage.list(),
        ctx.app.$api.appConfig()
    ];

    if(ctx.store.state.cart.id) {
        promises.push(
            ctx.app.$api.cart.get({
                id: ctx.store.state.cart.id,
                _withRelated: '*'
            })
        );
    }

    const [
        productTypes,
        productSubTypes,
        productAccentMessages,
        appConfig,
        shoppingCart
    ] = await Promise.all(promises);

    ctx.store.dispatch('product/PRODUCT_TYPES', productTypes?.data);
    ctx.store.dispatch('product/PRODUCT_SUBTYPES', productSubTypes?.data);
    ctx.store.dispatch('product/PRODUCT_SKU_ACCENT_MESSAGES', productAccentMessages?.data);

    if(isObject(appConfig?.data)) {
        // Separating out exchange_rates
        ctx.store.dispatch('ui/EXCHANGE_RATES', { ...appConfig.data.exchange_rates });
        delete appConfig.data.exchange_rates;

        ctx.store.dispatch('ui/APP_CONFIG', appConfig.data);
    }

    if(!ctx.store.state.cart.id || !shoppingCart?.data) {
        ctx.store.dispatch('cart/CART_RESET');
    }
    else {
        ctx.store.dispatch('cart/CART', shoppingCart?.data);
    }
};
