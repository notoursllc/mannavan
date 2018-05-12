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
                shopping_cart_mixin.methods.getCartClientToken.call(app).then((token) => {
                    app.store.dispatch('shoppingcart/CART_TOKEN_SET', token);
                    // console.log("NUXTSERVERINIT - NO COOKIE SO GOT TOKEN");
                    return resolve();
                })
                .catch(error => {
                    console.log("ERROR GETTING CART TOKEN", error);
                    return resolve();
                });
            }
        });
    },


    /**
     * Gets the token from the cookie (if a server side request)
     * or localStorage (if a client side request) and adds the token
     * to vuex state
     */
    initJwt2(vuexContext, req) {
        let token;
        // let expirationDate;

        // server side request
        if (req) {
            if (!req.headers.cookie) {
                return;
            }

            const jwtCookie = req.headers.cookie
                .split(";")
                .find(c => c.trim().startsWith("jwt="));

            if (!jwtCookie) {
                return;
            }

            token = jwtCookie.split("=")[1];
            // expirationDate = req.headers.cookie
            //     .split(";")
            //     .find(c => c.trim().startsWith("expirationDate="))
            //     .split("=")[1];
        }
        // client side request
        else {
            token = localStorage.getItem("token");
            // expirationDate = localStorage.getItem("tokenExpiration");
        }

        // if (new Date().getTime() > +expirationDate || !token) {
        //     console.log("No token or invalid token");
        //     vuexContext.dispatch("logout");
        //     return;
        // }

        vuexContext.commit("JWT_KEY", token);
    },



    // requestJwt({ commit }) {
    //     return this.$axios
    //         .$post('/api/v1/token/get')
    //         .then((response) => {
    //             // Token is returned in the 'x-authorization' response header
    //             // const token = response.headers['x-authorization'];
    //             commit('JWT_KEY', response.token);
    //         })
    //         .catch(error => {
    //             console.log("ERROR GETTING TOKEN FROM nuxtServerInit", error)
    //             commit('JWT_KEY', null);
    //         });
    // }
}


export const getters = {
    isAuthenticated (state) {
        return !!state.user
    },

    loggedUser (state) {
        return state.user
    }
}
