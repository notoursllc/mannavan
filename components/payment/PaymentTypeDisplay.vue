<script>
    import CreditCardIcon from '@/components/CreditCardIcon'

    export default{
        props: {
            transaction: {
                type: Object
            }
        },

        components: {
            CreditCardIcon
        },

        methods: {
            isPaypalTransaction() {
                //TODO: needs paypal check update - this logic probably isnt right
                return this.transaction.payment && this.transaction.payment.type === 'paypal_account';
            }
        },

        computed: {
            cardType: function() {
                let type = null;

                if(this.isPaypalTransaction()) {
                    type = 'paypal_account';
                }
                else {
                    if(Array.isArray(this.transaction.tenders)) {
                        this.transaction.tenders.forEach((obj) => {
                            type = obj.card_details.card.card_brand;
                        });
                    }
                }

                return type;
            },

            lastFour: function() {
                let last_four = null;

                if(Array.isArray(this.transaction.tenders)) {
                    this.transaction.tenders.forEach((obj) => {
                        last_four = obj.card_details.card.last_4;
                    });
                }

                return last_four;
            },

            payerEmail: function() {
                if(this.isPaypalTransaction()) {
                    return this.transaction.payment.payerEmail;
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
        <span v-show="payerEmail">{{ payerEmail }}</span>
    </span>
</template>
