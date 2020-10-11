export const state = () => ({
    types: {},
    subTypes: {},
    skuAccentMessages: {}
});


export const mutations = {
    PRODUCT_TYPES: (state, productTypes) => {
        if(Array.isArray(productTypes)) {
            productTypes.forEach((obj) => {
                state.types[obj.name] = obj;
            });
        }
    },

    PRODUCT_SUBTYPES: (state, subTypes) => {
        if(Array.isArray(subTypes)) {
            subTypes.forEach((obj) => {
                state.subTypes[obj.name] = obj;
            });
        }
    },

    PRODUCT_SKU_ACCENT_MESSAGES: (state, accentMessages) => {
        if(Array.isArray(accentMessages)) {
            accentMessages.forEach((obj) => {
                state.skuAccentMessages[obj.id] = obj.message;
            });
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
