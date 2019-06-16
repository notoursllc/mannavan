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

        methods: {
            isPaypalTransaction() {
                return parseInt(this.payment.payment_type, 10) === 2;
            }
        },

        computed: {
            cardType: function() {
                let type = null;

                if(this.isPaypalTransaction()) {
                    type = 'paypal';
                }
                else {
                    if(Array.isArray(this.payment.transaction.tenders)) {
                        this.payment.transaction.tenders.forEach((obj) => {
                            type = obj.card_details.card.card_brand;
                        });
                    }
                }

                return type;
            },

            lastFour: function() {
                let last_four = null;

                if(!this.isPaypalTransaction() && Array.isArray(this.payment.transaction.tenders)) {
                    this.payment.transaction.tenders.forEach((obj) => {
                        last_four = obj.card_details.card.last_4;
                    });
                }

                return last_four;
            },

            paypalPayerEmail: function() {
                if(this.isPaypalTransaction()) {
                    return this.payment.transaction.result.payer.email_address;
                }
                return null;
            }
        },
    }
</script>


<template>
    <span>
        <credit-card-icon :card-type="cardType" />&nbsp;
        <span v-show="lastFour">**** {{ lastFour }}</span>
        <span v-show="paypalPayerEmail" class="pls">{{ paypalPayerEmail }}</span>
    </span>
</template>
