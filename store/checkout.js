'use strict';

function initialState() {
    return {
        validations: {
            shippingForm: false,
            billingForm: false,
            paymentForm: false
        },
        shippingMethod: '1',
        paymentMethod: 'CREDIT_CARD',
        isLoading: false
    }
}

export const state = initialState;

export const mutations = {
    SHIPPING_FORM_VALID: (state, isValid) => {
        state.validations.shippingForm = isValid;
    },

    BILLING_FORM_VALID: (state, isValid) => {
        state.validations.billingForm = isValid;
    },

    PAYMENT_FORM_VALID: (state, isValid) => {
        state.validations.paymentForm = isValid;
    },

    SHIPPING_METHOD: (state, val) => {
        state.shippingMethod = val;
    },

    PAYMENT_METHOD: (state, val) => {
        state.paymentMethod = val;
    },

    IS_LOADING: (state, isLoading) => {
        state.isLoading = isLoading;
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

    BILLING_FORM_VALID: ({ commit }, isValid) => {
        commit('BILLING_FORM_VALID', isValid);
    },

    PAYMENT_FORM_VALID: ({ commit }, isValid) => {
        commit('PAYMENT_FORM_VALID', isValid);
    },

    SHIPPING_METHOD: ({ commit }, val) => {
        commit('SHIPPING_METHOD', val);
    },

    PAYMENT_METHOD: ({ commit }, val) => {
        commit('PAYMENT_METHOD', val);
    },

    IS_LOADING: ({ commit }, isLoading) => {
        commit('IS_LOADING', isLoading);
    },

    RESET: ({ commit }) => {
        commit('RESET');
    }
}

export const getters = {
}
