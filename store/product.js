export const state = () => ({
    types: {},
    subTypes: {},
    skuAccentMessages: {}
});


export const mutations = {
    PRODUCT_TYPES: (state, productTypes) => {
        if(Array.isArray(productTypes)) {
            const types = {};
            productTypes.forEach((obj) => {
                types[obj.name] = obj;
            });
            state.types = types;
        }
    },

    PRODUCT_SUBTYPES: (state, subTypes) => {
        if(Array.isArray(subTypes)) {
            const val = {};
            subTypes.forEach((obj) => {
                val[obj.name] = obj;
            });
            state.subTypes = val;
        }
    },

    PRODUCT_SKU_ACCENT_MESSAGES: (state, accentMessages) => {
        if(Array.isArray(accentMessages)) {
            const messages = {};
            accentMessages.forEach((obj) => {
                messages[obj.id] = obj.message;
            });
            state.skuAccentMessages = messages;
        }
    }
};


export const actions = {
    PRODUCT_TYPES ({ commit }, productTypes) {
        commit('PRODUCT_TYPES', productTypes);
    },

    PRODUCT_SUBTYPES ({ commit }, subTypes) {
        commit('PRODUCT_SUBTYPES', subTypes);
    },

    PRODUCT_SKU_ACCENT_MESSAGES ({ commit }, accentMessages) {
        commit('PRODUCT_SKU_ACCENT_MESSAGES', accentMessages);
    }
};


export const getters = {
    subTypes: (state) => {
        return state.subTypes;
    }
};
