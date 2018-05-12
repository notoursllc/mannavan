export default function ({ $axios, store }) {
    $axios.setToken(store.state.jwtKey, 'Bearer');
}
