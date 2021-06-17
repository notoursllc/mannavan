<script>
import paypal from 'paypal-checkout';

export default {
    mounted() {
        paypal.Button.render(
            {
                env: this.$config.nodeEnvIsDev ? 'sandbox' : 'production',
                payment: this.payment,
                onAuthorize: this.onAuthorize,
                onCancel: this.onCancel,
                onError: this.onError,
                debug: this.$config.nodeEnvIsDev,

                // https://developer.paypal.com/docs/archive/checkout/how-to/customize-button/#button-styles
                style: {
                    color: 'blue',
                    shape: 'pill',
                    label: 'pay',
                    height: 55,
                    size: 'responsive',
                    tagline: false
                }
            },
            '#paypal-button'
        );
    },

    methods: {
        payment(data, actions) {
            return new paypal.Promise(async (resolve, reject) => {
                try {
                    const res = await this.$api.cart.payment.paypal.create(this.$store.state.cart.id);
                    resolve(res.paymentToken);
                }
                catch(err) {
                    // this.onError(err);
                    reject(err);
                }
            });
        },

        onAuthorize(data, actions) {
            return new paypal.Promise(async (resolve, reject) => {
                try {
                    const res = await this.$api.cart.payment.paypal.execute(
                        this.$store.state.cart.id,
                        data.paymentToken
                    );

                    // console.log('onAuthorize SUCCESS', res);
                    this.$emit('success', res);
                    resolve(res);
                }
                catch(err) {
                    // this.onError(err);
                    reject(err);
                }
            });
        },

        onCancel(data) {
            this.$emit('cancelled', data);
        },

        onError(data) {
            console.error(data);
            this.$emit('error', data);
        }
    }
};
</script>


<template>
    <div id="paypal-button"></div>
</template>
