'use strict';

export const state = () => ({
    sidebarOpened: true,
    isMobile: false,
    locales: ['en', 'fr'],
    locale: 'en',
    pageTitle: null,
    inCheckoutFlow: false
});

export const mutations = {
    CLOSE_SIDEBAR: (state) => {
        state.sidebarOpened = false
    },

    OPEN_SIDEBAR: (state) => {
        state.sidebarOpened = true
    },

    TOGGLE_SIDEBAR: (state) => {
        state.sidebarOpened = !state.sidebarOpened
    },

    LOCATION_CHANGE: (state) => {
        state.sidebarOpened = false
    },

    WINDOW_RESIZE: (state) => {
        const { innerWidth } = window
        const isDesktop = innerWidth > 1024
        state.isMobile = !isDesktop
        state.sidebarOpened = isDesktop
    },

    SET_LANG(state, locale) {
        if (state.locales.indexOf(locale) !== -1) {
            state.locale = locale
        }
    },

    PAGE_TITLE(state, title) {
        state.pageTitle = title;
    },

    IN_CHECKOUT_FLOW: (state, inCheckoutFlow) => {
        state.inCheckoutFlow = inCheckoutFlow;
    }
}

export const actions = {
    openSidebar ({ commit }) {
        commit('OPEN_SIDEBAR')
    },

    closeSidebar ({ commit }) {
        commit('CLOSE_SIDEBAR')
    },

    toggleSidebar ({ commit }) {
        commit('TOGGLE_SIDEBAR')
    },

    windowResize ({ commit }) {
        commit('WINDOW_RESIZE')
    },

    pageTitle({ commit }, title) {
        commit('PAGE_TITLE', title)
    },

    IN_CHECKOUT_FLOW: ({ commit }, inCheckoutFlow) => {
        commit('IN_CHECKOUT_FLOW', inCheckoutFlow);
    }
}


export const getters = {
    inCheckoutFlow: (state) => {
        return state.inCheckoutFlow;
    }
}
