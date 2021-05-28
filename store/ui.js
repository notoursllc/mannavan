import isObject from 'lodash.isobject';

const domainName = 'goBreadVan.com';

// This doens't need to be reactive, so not in state
const messageInstances = [];

export const state = () => ({
    sidebarOpened: true,
    isMobile: false,
    locales: ['en-US', 'fr-FR'],
    locale: 'en-US',
    inCheckoutFlow: false,
    infoEmailAddress: `info@${domainName}`,
    brandName: 'BreadVan',
    siteName: domainName,
    siteUrlLong: process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : `https://www.${domainName}`,
    siteUrlShort: process.env.NODE_ENV === 'development' ? 'localhost:3000' : `www.${domainName}`,
    twitterUser: 'gmnstLife',
    appConfig: {}
});

export const mutations = {
    CLOSE_SIDEBAR: (state) => {
        state.sidebarOpened = false;
    },

    OPEN_SIDEBAR: (state) => {
        state.sidebarOpened = true;
    },

    TOGGLE_SIDEBAR: (state) => {
        state.sidebarOpened = !state.sidebarOpened;
    },

    LOCATION_CHANGE: (state) => {
        state.sidebarOpened = false;
    },

    WINDOW_RESIZE: (state) => {
        const { innerWidth } = window;
        const isDesktop = innerWidth > 1024;
        state.isMobile = !isDesktop;
        state.sidebarOpened = isDesktop;
    },

    SET_LANG(state, locale) {
        if (state.locales.indexOf(locale) !== -1) {
            state.locale = locale;
        }
    },

    IN_CHECKOUT_FLOW: (state, inCheckoutFlow) => {
        state.inCheckoutFlow = inCheckoutFlow;
    },

    ADD_MESSAGE_INSTANCE: (state, messageInstance) => {
        messageInstances.push(messageInstance);
    },

    CLOSE_MESSAGE_INSTANCES: (state) => {
        messageInstances.forEach((messageInstance) => {
            messageInstance.close();
        });
    },

    APP_CONFIG: (state, config) => {
        if(isObject(config)) {
            for(const prop in config) {
                state.appConfig[prop] = config[prop];
            }
        }
    }
};

export const actions = {
    openSidebar ({ commit }) {
        commit('OPEN_SIDEBAR');
    },

    closeSidebar ({ commit }) {
        commit('CLOSE_SIDEBAR');
    },

    toggleSidebar ({ commit }) {
        commit('TOGGLE_SIDEBAR');
    },

    windowResize ({ commit }) {
        commit('WINDOW_RESIZE');
    },

    IN_CHECKOUT_FLOW: ({ commit }, inCheckoutFlow) => {
        commit('IN_CHECKOUT_FLOW', inCheckoutFlow);
    },

    ADD_MESSAGE_INSTANCE: ({ commit }, messageInstance) => {
        commit('ADD_MESSAGE_INSTANCE', messageInstance);
    },

    CLOSE_MESSAGE_INSTANCES: ({ commit }) => {
        commit('CLOSE_MESSAGE_INSTANCES');
    },

    APP_CONFIG ({ commit }, config) {
        commit('APP_CONFIG', config);
    }
};


export const getters = {
    inCheckoutFlow: (state) => {
        return state.inCheckoutFlow;
    }
};
