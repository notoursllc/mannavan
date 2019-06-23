'use strict';

export const state = () => ({
    subTypes: {
        PRODUCT_SUBTYPE_HATS: 1,
        PRODUCT_SUBTYPE_TOPS: 2
    },
    seoUri: {
        PRODUCT_SUBTYPE_HATS: 'hats',
        PRODUCT_SUBTYPE_TOPS: 'tops'
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
