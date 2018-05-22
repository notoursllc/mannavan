import * as Cookies from 'js-cookie'
import shopping_cart_mixin from '@/mixins/shopping_cart_mixin';

export default ({ $axios, store }) => {
    // TODO: store.state.shoppingcart.token is not set on www.gobreadvan.com
    if(store.state.shoppingcart.token) {
        let domain = process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : null;
        console.log("COOKIE DOMAIN", domain);

        // Cookies.set(
        //     'cart-jwt',
        //     store.state.shoppingcart.token,
        //     domain
        // );
        Cookies.set(
            'cart-jwt',
            store.state.shoppingcart.token
        );
    }
}
