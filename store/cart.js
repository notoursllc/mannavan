import isObject from 'lodash.isobject';
import forEach from 'lodash.foreach';

function getCartDefaults() {
    return {
        billingSameAsShipping: true,
        shipping_firstName: null,
        shipping_lastName: null,
        shipping_streetAddress: null,
        shipping_extendedAddress: null,
        shipping_company: null,
        shipping_city: null,
        shipping_state: null,
        shipping_postalCode: null,
        shipping_countryCodeAlpha2: null,
        shipping_email: null,
        billing_firstName: null,
        billing_lastName: null,
        billing_company: null,
        billing_streetAddress: null,
        billing_extendedAddress: null,
        billing_city: null,
        billing_state: null,
        billing_postalCode: null,
        billing_countryCodeAlpha2: null,
        billing_phone: null,
        num_items: 0,
        product_weight_total: 0,
        sub_total: null,
        shipping_total: null,
        shipping_rate: null,
        sales_tax: null,
        grand_total: null
    };
}

export const state = () => ({
    // There seems to be an issue with reactivity in the UI
    // if state properties do not exist by default.  Defining these properties
    // that need to have immediate UI reactivity solves the issue
    cart: getCartDefaults()
});


export const mutations = {
    CART: (state, cartData) => {
        forEach(cartData, (val, key) => {
            state.cart[key] = val;
        });

        if(state.cart.num_items === 0) {
            state.cart.cart_items = [];
        }

                state.updated = new Date();
    },

    CART_ID: (state, id) => {
        state.id = id;
    }
};


export const actions = {
    CART ({ commit }, cart) {
        commit('CART', cart);
    },

    CART_ID ({ commit }, id) {
        commit('CART_ID', id);
    }
};


export const getters = {

};
