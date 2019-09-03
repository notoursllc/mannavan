'use strict';

function initialState() {
    return {
        validations: {
            shippingForm: false
        },
        shippingMethod: '1'
    }
}

export const state = initialState;

export const mutations = {
    SHIPPING_FORM_VALID: (state, isValid) => {
        state.validations.shippingForm = isValid;
    },

    SHIPPING_METHOD: (state, val) => {
        state.shippingMethod = val;
    },

    RESET: (state) => {
        let s = initialState();

        Object.keys(s).forEach((key) => {
            state[key] = s[key];
        })
    }
}

export const actions = {
    SHIPPING_FORM_VALID: ({ commit }, isValid) => {
        commit('SHIPPING_FORM_VALID', isValid);
    },

    SHIPPING_METHOD: ({ commit }, val) => {
        commit('SHIPPING_METHOD', val);
    },

    RESET: ({ commit }) => {
        commit('RESET');
    }
}

export const getters = {
}
