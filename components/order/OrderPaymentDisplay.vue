<script>
    import CreditCardIcon from '@/components/CreditCardIcon'

    export default{
        props: {
            payment: {
                type: Object
            }
        },

        components: {
            CreditCardIcon
        },

        data: function() {
            return {
                paymentData: {}
            }
        },

        computed: {
            cardType: function() {
                if(this.paymentData.type === 'paypal_account') {
                    return 'paypal';
                }

                return this.paymentData.cardType;
            }
        },

        created() {
            const unwatch = this.$watch('payment', val => {
                if(val) {
                    this.paymentData = val;
                    unwatch();
                }
            }, {immediate: true})
        }
    }
</script>


<template>
    <span>payment: {{ payment }}
        <credit-card-icon :card-type="cardType"></credit-card-icon>&nbsp;
        <span v-if="paymentData.last4">**** {{ paymentData.last4 }}</span>
        <span v-if="paymentData.payerEmail">{{ paymentData.payerEmail }}</span>
    </span>
</template>
