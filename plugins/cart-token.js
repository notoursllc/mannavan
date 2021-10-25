import * as Cookies from 'js-cookie'

export default ({ $axios, $config, store }) => {
    // TODO: store.state.shoppingcart.token is not set on www.gobreadvan.com
    if(store.state.shoppingcart.token) {
        const config = {
            secure: $config.cookieSecure
        };

        Cookies.set(
            'cart-jwt',
            store.state.shoppingcart.token,
            config
        );
    }
}
