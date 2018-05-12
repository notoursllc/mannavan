export default function ({store, redirect, route}) {
    const isLoggedIn = new Date().getTime() < store.state.auth.expires_at;
    const urlRequiresAuth = /^\/acts(\/|$)/.test(route.fullPath)
    const urlRequiresNonAuth = /^\/login(\/|$)/.test(route.fullPath)

    if (!isLoggedIn && urlRequiresAuth) {
        return redirect('/login')
    }

    // If going to the login page but already logged in,
    // then redirect to the admin product listpage
    if (isLoggedIn && urlRequiresNonAuth) {
        return redirect('/acts/product/list')
    }

    return Promise.resolve();
}
