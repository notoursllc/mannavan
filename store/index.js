import Cookie from 'cookie';
import jwt from 'jsonwebtoken';
import shopping_cart_mixin from '@/mixins/shopping_cart_mixin';


export const state = () => ({
    user: null,
    jwtToken: null,
    jwtRefreshToken: null,
    jwtTokenDecoded: null
});

export const mutations = {
    SET_USER (state, user) {
        state.user = user || null
    },

    SET_JWT_TOKEN (state, token) {
        state.jwtToken = token || null;
        state.jwtTokenDecoded = jwt.decode(token);
    },

    SET_JWT_REFRESH_TOKEN (state, token) {
        state.jwtRefreshToken = token || null;
    }
}

export const actions = {
    async nuxtServerInit({ commit }, { req, app }) {
        try {
            if (req.headers.cookie) {
                const parsed = Cookie.parse(req.headers.cookie);

                if(parsed['cart_token']) {
                    const response = await shopping_cart_mixin.methods.getCart.call(app);
                    shopping_cart_mixin.methods.setCartAndTokenStateFromResponse.call({ $store: app.store }, response);
                }
            }
        }
        catch(err) {
            console.error("ERROR GETTING CART TOKEN", err);
        }
    },

    SET_JWT_TOKEN: ({ commit }, token) => {
        commit('SET_JWT_TOKEN', token);
    },

    SET_JWT_REFRESH_TOKEN: ({ commit }, token) => {
        commit('SET_JWT_REFRESH_TOKEN', token);
    }
}


export const getters = {
    isAuthenticated (state) {
        return !!state.user
    },

    loggedUser (state) {
        return state.user
    },

    // https://www.npmjs.com/package/jsonwebtoken#jwtverifytoken-secretorpublickey-options-callback
    jwtTokenIsValid(state) {
        try {
            const decoded = jwt.verify(state.jwtToken, process.env.JWT_TOKEN_SECRET);
            return decoded;
        }
        catch(err) {
            // https://www.npmjs.com/package/jsonwebtoken#errors--codes
            return false;
        }
    }
}
