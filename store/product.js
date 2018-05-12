'use strict';

export const state = () => ({
    subTypes: {
        PRODUCT_SUBTYPE_HAT: 1,
        PRODUCT_SUBTYPE_TOP: 2
    },
    seoUri: {
        PRODUCT_SUBTYPE_HAT: 'hats',
        PRODUCT_SUBTYPE_TOP: 'tops'
    }
})


export const mutations = {
}


export const getters = {
    subTypes: (state) => {
        return state.subTypes;
    },

    seoUri: (state) => {
        return state.seoUri;
    }
}

export const actions = {
    getIdByProductType: (vuexContext, type) => {
        let id = 0;
        let subtype = null;

        Object.keys(vuexContext.state.seoUri).forEach((key) => {
            if (vuexContext.state.seoUri[key] === type && vuexContext.state.subTypes.hasOwnProperty(key)) {
                id = vuexContext.state.subTypes[key];
                subtype = key;
            }
        });

        return {
            productTypeId: id,
            productSubType: subtype
        };
    }
}
