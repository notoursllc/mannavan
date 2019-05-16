'use strict';

import isObject from 'lodash.isobject'
import forEach from 'lodash.foreach'
import * as Cookies from 'js-cookie'
import cloneDeep from 'lodash.clonedeep'

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
    }
}


export const state = () => ({
    // There seems to be an issue with reactivity in the UI
    // if state properties do not exist by default.  Defining these properties
    // that need to have immediate UI reactivity solves the issue
    cart: getCartDefaults(),
    token: null,
    shippingRatesCache: {
        updated: null,
        cache: null
    },
    shippingAddressIsValid: false,
    billingAddressIsValid: false,

    //test
    updated: null
});

export const mutations = {
    CART_TOKEN_SET: (state, token) => {
        state.token = token;
        Cookies.set(
            'cart_token',
            token,
            { secure: process.env.COOKIE_SECURE || false }
        );
    },

    CART_SET: (state, cartData) => {
        // state.cart = cloneDeep(cartData);
        forEach(cartData, (val, key) => {
            state.cart[key] = val;
        });

        if(state.cart.num_items === 0) {
            state.cart.cart_items = [];
        }

        state.updated = new Date();
    },

    ATTRIBUTE_SET: (state, config) => {
        state.cart[config.attribute] = config.value || null;
    },

    SET_SHIPPING_RATES_CACHE: (state, data) => {
        state.shippingRatesCache.updated = new Date().getTime();
        state.shippingRatesCache.cache = data;
    },

    CLEAR_SHIPPING_RATES_CACHE: (state, data) => {
        state.shippingRatesCache.updated = null;
        state.shippingRatesCache.cache = null;
    },

    CHECKOUT_CLEANUP: (state, data) => {
        state.cart = getCartDefaults();
        state.token = null;
    },

    SHIPPING_ADDRESS_IS_VALID: (state, isValid) => {
        state.shippingAddressIsValid = isValid;
    },

    BILLING_ADDRESS_IS_VALID: (state, isValid) => {
        state.billingAddressIsValid = isValid;
    },
}

export const actions = {
    CART_TOKEN_SET: ({ commit }, token) => {
        commit('CART_TOKEN_SET', token)
    },

    CART_SET: ({ commit }, data) => {
        commit('CART_SET', data)
    },

    ATTRIBUTE_SET: ({ commit }, config) => {
        let conf = Array.isArray(config) ? config : [config];

        conf.forEach((obj) => {
            if(isObject(obj) &&
                obj.hasOwnProperty('attribute') &&
                obj.hasOwnProperty('value')) {
                commit('ATTRIBUTE_SET', obj)
            }
        });
    },

    SET_SHIPPING_RATES_CACHE: ({ commit }, data) => {
        commit('SET_SHIPPING_RATES_CACHE', data)
    },

    CLEAR_SHIPPING_RATES_CACHE: ({ commit }, data) => {
        commit('CLEAR_SHIPPING_RATES_CACHE', data)
    },

    CHECKOUT_CLEANUP: ({ commit }) => {
        commit('CHECKOUT_CLEANUP');
        commit('CLEAR_SHIPPING_RATES_CACHE');
    },

    SHIPPING_ADDRESS_IS_VALID: ({ commit }, isValid) => {
        commit('SHIPPING_ADDRESS_IS_VALID', isValid)
    },

    BILLING_ADDRESS_IS_VALID: ({ commit }, isValid) => {
        commit('BILLING_ADDRESS_IS_VALID', isValid)
    }
}

export const getters = {
    cart: (state) => {
        return state.cart;
    },

    numItems: (state) => {
        return state.cart.num_items || 0;
    },

    shippingAttributes: (state) => {
        let attrs = {};

        Object.keys(state.cart).forEach((key) => {
            if(key.indexOf('shipping_') === 0) {
                attrs[key] = state.cart[key]
            }
        });

        return attrs;
    },

    billingAttributes: (state) => {
        let attrs = {};

        Object.keys(state.cart).forEach((key) => {
            if(key.indexOf('billing_') === 0) {
                attrs[key] = state.cart[key]
            }
        });

        return attrs;
    },

    shippingRateCache: (state) => {
        return state.shippingRatesCache;
    }
}
