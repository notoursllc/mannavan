import { getUserFromCookie, getUserFromLocalStorage } from '@/utils/auth'

export default function ({ store, req }) {
    const loggedUser = process.server ? getUserFromCookie(req) : getUserFromLocalStorage()
    store.commit('SET_USER', loggedUser)
}
