import Cookie from 'cookie';
import shopping_cart_mixin from '@/mixins/shopping_cart_mixin';


export const state = () => ({
    jwtKey: null,
    user: null
});

export const mutations = {
    JWT_KEY: (state, key) => {
        state.jwtKey = key
    },

    SET_USER (state, user) {
        state.user = user || null
    }
}

export const actions = {
    JWT_KEY: ({ commit }, key) => {
        commit('JWT_KEY', key)
    },

    /**
     * If there's a cookie in the request header, get the cart and save it in vuex,
     * otherwise we get the client token and save it in vuex
     */
    nuxtServerInit({ commit }, { req, app }) {
        return new Promise((resolve, reject) => {
            let accessToken = null;

            if (req.headers.cookie) {
                let parsed = Cookie.parse(req.headers.cookie);

                app.store.dispatch('shoppingcart/CART_TOKEN_SET', parsed['cart-jwt']);

                shopping_cart_mixin.methods.getCart.call(app)
                    .then((shoppingCart) => {
                        // console.log("NUXTSERVERINIT - GOT CART", shoppingCart);
                        app.store.dispatch('shoppingcart/CART_SET', shoppingCart)
                        return resolve();
                    })
                    .catch(error => {
                        console.log("ERROR GETTING SHOPPING CART");
                        return resolve();
                    });
            }
            else {
                app.$axios
                    .get('/jwt')
                    .then((response) => {
                        app.store.dispatch('shoppingcart/CART_TOKEN_SET', response.headers.authorization);

                        // Note: using Cookie.serialize here wont work.  It doesn't actually
                        // set a cookie, but instead will "Serialize a cookie name-value pair into a Set-Cookie header string",
                        // which is not what we want (https://github.com/jshttp/cookie#cookieserializename-value-options)
                        // So, we're setting the token in vuex, and the cart-token nuxt plugin will pull the
                        // value from vuex and set in a cookie.

                        return resolve();
                    })
                    .catch(error => {
                        console.log("ERROR GETTING CART TOKEN", error);
                        return resolve();
                    });
            }
        });
    }
}


export const getters = {
    isAuthenticated (state) {
        return !!state.user
    },

    loggedUser (state) {
        return state.user
    }
}
