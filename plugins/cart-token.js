import * as Cookies from 'js-cookie'
import shopping_cart_mixin from '@/mixins/shopping_cart_mixin';

export default ({ $axios, store }) => {
    if(store.state.shoppingcart.token) {
        Cookies.set('cart-jwt', store.state.shoppingcart.token);
    }
}
