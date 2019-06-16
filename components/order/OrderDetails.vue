<script>
import PaymentTypeDisplay from '@/components/payment/PaymentTypeDisplay'
import CartTotalsTable from '@/components/cart/CartTotalsTable'
import CartShippingAddressDisplay from '@/components/cart/CartShippingAddressDisplay'
import CartItems from '@/components/cart/CartItems'
import FormRow from '@/components/FormRow'
import payment_mixin from '@/mixins/payment_mixin';


export default {
    props: {
        order: {
            type: Object,
            required: true
        }
    },

    components: {
        PaymentTypeDisplay,
        CartTotalsTable,
        CartShippingAddressDisplay,
        FormRow,
        CartItems
    },

    mixins:[
        payment_mixin
    ],

    computed: {
        creditCardType: function() {
            if(this.order.transaction.paymentInstrumentType === 'paypal_account') {
                return 'paypal';
            }

            return this.order.transaction.creditCard.cardType;
        }
    }
}
</script>

<template>
    <div>
        <div class="mbl">
            <form-row>
                <template slot="label"><span class="fwb">{{ $t('Ordered on') }}:</span></template>
                <template slot="value">{{ order.created_at | format8601 }}</template>
            </form-row>

            <form-row>
                <template slot="label"><span class="fwb">{{ $t('Order') }}:</span></template>
                <template slot="value">{{ order.id }}</template>
            </form-row>

            <form-row>
                <template slot="label"><span class="fwb">{{ $t('Payment method') }}:</span></template>
                <template slot="value">
                    <payment-type-display :payment="order" />
                </template>
            </form-row>
        </div>

        <div>
            <div class="mbl mrxl inlineBlock vat">
                <div class="fwb">{{ $t('Shipping to') }}:</div>
                <cart-shipping-address-display
                            :shopping-cart="order.shoppingCart" />
            </div>

            <div class="mbl inlineBlock vat">
                <div class="fwb">{{ $t('Order summary') }}:</div>
                <div>
                    <cart-totals-table
                        :cart="order.shoppingCart"
                        :show-shipping-cost="true"
                        :show-sales-tax="true"
                        label-class="tal" />
                </div>
            </div>
        </div>

        <cart-items
            :shopping-cart="order.shoppingCart"
            :allow-edit="false" />
    </div>
</template>
