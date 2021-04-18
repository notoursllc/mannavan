// import Cookie from 'cookie';
// import shopping_cart_mixin from '@/mixins/shopping_cart_mixin';


export const state = () => ({
    user: null,
    CART_MAX_TOTAL_QUANTITY: null
});

export const mutations = {
    SET_USER (state, user) {
        state.user = user || null;
    }
};

export const actions = {
    // async nuxtServerInit({ commit }, { req, app }) {
    //     try {
    //         if (req.headers.cookie) {
    //             const parsed = Cookie.parse(req.headers.cookie);

    //             if(parsed.cart_token) {
    //                 const response = await shopping_cart_mixin.methods.getCart.call(app);
    //                 shopping_cart_mixin.methods.setCartAndTokenStateFromResponse.call({ $store: app.store }, response);
    //             }
    //         }
    //     }
    //     catch(err) {
    //         console.error("ERROR GETTING CART TOKEN", err);
    //     }
    // }
};


export const getters = {
    isAuthenticated (state) {
        return !!state.user;
    },

    loggedUser (state) {
        return state.user;
    }
};
