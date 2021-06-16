import forEach from 'lodash.foreach';
import isObject from 'lodash.isobject';

function getCartDefaults() {
    return {
        billing_city: null,
        billing_company: null,
        billing_countryCodeAlpha2: null,
        billing_extendedAddress: null,
        billing_firstName: null,
        billing_lastName: null,
        billing_phone: null,
        billing_postalCode: null,
        billing_state: null,
        billing_streetAddress: null,
        billingSameAsShipping: true,
        cart_items: [],
        created_at: null,
        currency: null,
        grand_total: null,
        id: null,
        num_items: 0,
        sales_tax: null,
        shipping_city: null,
        shipping_company: null,
        shipping_countryCodeAlpha2: null,
        shipping_email: null,
        shipping_extendedAddress: null,
        shipping_firstName: null,
        shipping_lastName: null,
        shipping_postalCode: null,
        shipping_state: null,
        shipping_streetAddress: null,
        shipping_phone: null,
        shipping_total: null,
        shipping_rate: {},
        sub_total: null,
        updated_at: null,
        weight_oz_total: null
    };
}

export const state = () => ({
    // There seems to be an issue with reactivity in the UI
    // if state properties do not exist by default.  Defining these properties
    // that need to have immediate UI reactivity solves the issue
    ...getCartDefaults()
});


export const mutations = {
    CART: (state, cartData) => {
        console.log("CART MUTATION", cartData)
        forEach(cartData, (val, key) => {
            state[key] = val;
        });

        if(state.num_items === 0) {
            state.cart_items = [];
        }

        state.updated = new Date();
    },

    CART_ID: (state, id) => {
        state.id = id;
    },

    ATTRIBUTE_SET: (state, config) => {
        state[config.attribute] = config.value;
    },

    CART_RESET: (state) => {
        forEach(getCartDefaults(), (val, key) => {
            state[key] = val;
        });
    }
};


export const actions = {
    CART ({ commit }, cart) {
        commit('CART', cart);
    },

    CART_ID ({ commit }, id) {
        commit('CART_ID', id);
    },

    ATTRIBUTE_SET: ({ commit }, config) => {
        const conf = Array.isArray(config) ? config : [config];

        conf.forEach((obj) => {
            if(isObject(obj) &&
                obj.hasOwnProperty('attribute') &&
                obj.hasOwnProperty('value')) {
                commit('ATTRIBUTE_SET', obj);
            }
        });
    },

    CART_RESET: ({ commit }) => {
        commit('CART_RESET');
    }
};


export const getters = {
    cart: (state) => {
        return state;
    },

    shippingRateTotal: (state) => {
        const rate = state.shipping_rate;
        let total = 0;

        if(isObject(rate)) {
            if(isObject(rate.shipping_amount)) {
                total += rate.shipping_amount.amount ? rate.shipping_amount.amount * 100 : 0;
            }

            if(isObject(rate.other_amount)) {
                total += rate.other_amount.amount ? rate.other_amount.amount * 100 : 0;
            }

            if(isObject(rate.insurance_amount)) {
                total += rate.insurance_amount.amount ? rate.insurance_amount.amount * 100 : 0;
            }

            if(isObject(rate.confirmation_amount)) {
                total += rate.confirmation_amount.amount ? rate.confirmation_amount.amount * 100 : 0;
            }
        }

        return total;
    },

    shippingRateEstimatedDeliveryDate: (state) => {
        const rate = state.shipping_rate;

        if(isObject(rate)) {
            return rate.estimated_delivery_date;
        }

        return null;
    }
};
