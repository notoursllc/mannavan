export default function ({store, redirect, route}) {
    const inCheckout = (route.name === 'cart-checkout');
    store.dispatch('ui/IN_CHECKOUT_FLOW', inCheckout);
}
