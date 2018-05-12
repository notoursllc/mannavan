import createPersistedState from 'vuex-persistedstate'
import * as Cookie from 'js-cookie'


export default ({ store, isHMR }) => {
    // In case of HMR, mutation occurs before nuxReady, so previously saved state
    // gets replaced with original state received from server. So, we've to skip HMR.
    // Also nuxtReady event fires for HMR as well, which results multiple registration of
    // vuex-persistedstate plugin
    if (isHMR) {
        return;
    }

    // if (process.client) {
        // window.onNuxtReady((nuxt) => {
            // if(!Cookie.getJSON('vuex')) {
                // console.log("CREATING PERSIST STATE", Cookie.getJSON('vuex'));
                createPersistedState({
                    // key: 'vuex',
                    // paths: [...]
                    // getState: (key) => Cookie.getJSON(key),
                    // setState: (key, state) => Cookie.set(key, state, { secure: false })

                    //test
                    getState: (key) => {
                        console.log("GETTING in COOKIE", key);
                        return Cookie.getJSON(key)
                    },
                    setState: (key, state) => {
                        Cookie.set(key, state, { secure: false });
                        console.log("SETTING IN COOKIE2", key, state, Cookie.getJSON(key))
                        return;
                    }

                    // Note: setting secure:true prevents the cookie from being created when
                    // using localhost without https
                })(store)
            // }
            // else {
            //     console.log("COOKIE ALRESDY EXISTS", Cookie.getJSON('vuex'))
            // }
        // })
    // }
}
