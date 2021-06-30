export default function (context) {
    context.store.dispatch(
        'ui/IN_CHECKOUT_FLOW',
        context.route.name === 'cart-checkout'
    );
}
