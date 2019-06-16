<script>
import paypal from 'paypal-checkout';
import shopping_cart_mixin from '@/mixins/shopping_cart_mixin'

export default {
    mixins: [
        shopping_cart_mixin
    ],

    methods: {
        payment(data, actions) {
            return new paypal.Promise(async (resolve, reject) => {
                try {
                    const res = await this.paypalCreatePayment();
                    resolve(res.paymentToken);
                }
                catch(err) {
                    reject(err);
                }
            })
        },

        onAuthorize(data, actions) {
            console.log("onAuthorize request", data);

            return new paypal.Promise(async (resolve, reject) => {
                try {
                    const res = await this.paypalExecutePayment(data.paymentToken);
                    console.log('onAuthorize SUCCESS', res);
                    this.$emit('payment-success', res);
                    resolve(res);
                }
                catch(err) {
                    reject(err);
                }
            });
        },

        onCancel(data) {
            this.$emit('payment-cancelled', data);
        },

        onError(data) {
            this.$emit('payment-error', data);
        },
    },

    mounted() {
        paypal.Button.render(
            {
                env: process.env.NODE_ENV === 'development' ? 'sandbox' : 'production',
                payment: this.payment,
                onAuthorize: this.onAuthorize,
                onCancel: this.onCancel,
                onError: this.onError,
                debug: process.env.NODE_ENV === 'development',

                // https://developer.paypal.com/docs/archive/checkout/how-to/customize-button/#button-styles
                style: {
                    color:  'blue',
                    shape:  'pill',
                    label:  'pay',
                    height: 55,
                    size: 'responsive',
                    tagline: false
                }
            },
            '#paypal-button'
        );
    }
}
</script>


<template>
    <div id="paypal-button"></div>
</template>
