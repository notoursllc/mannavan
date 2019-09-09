<script>
export default{
    props: {
        payment: {
            type: Object
        }
    },

    components: {
        CreditCardIcon: () => import('@/components/CreditCardIcon')
    },

    methods: {
        isPaypalTransaction() {
            return parseInt(this.payment.payment_type, 10) === 2;
        }
    },

    computed: {
        cardType: function() {
            return this.isPaypalTransaction() ? 'paypal' : this.payment.transaction.card_details.card.card_brand;
        },

        lastFour: function() {
            return this.isPaypalTransaction() ? null : this.payment.transaction.card_details.card.last_4;
        },

        paypalPayerEmail: function() {
            return this.isPaypalTransaction() ? this.payment.transaction.result.payer.email_address : null;
        }
    }
}
</script>


<template>
    <span>
        <credit-card-icon :card-type="cardType" />
        <span v-if="lastFour" class="pls">**** {{ lastFour }}</span>
        <span v-if="paypalPayerEmail" class="pls">{{ paypalPayerEmail }}</span>
    </span>
</template>
