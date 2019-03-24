<script>
import PaymentTypeDisplay from '@/components/PaymentTypeDisplay'
import CartTotalsTable from '@/components/cart/CartTotalsTable'
import AddressDisplay from '@/components/AddressDisplay'
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
        AddressDisplay,
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
                <template slot="label">{{ $t('Ordered on') }}:</template>
                <template slot="value">{{ order.created_at | format8601 }}</template>
            </form-row>

            <form-row>
                <template slot="label">{{ $t('Order') }}:</template>
                <template slot="value">{{ order.id }}</template>
            </form-row>
        </div>

        <div>
            <div class="mbl mrxl inlineBlock vat">
                <div class="fwb">{{ $t('Shipping to') }}:</div>
                <address-display
                    :first-name="order.shoppingCart.shipping_firstName"
                    :last-name="order.shoppingCart.shipping_lastName"
                    :street-address="order.shoppingCart.shipping_streetAddress"
                    :extended-address="order.shoppingCart.shipping_extendedAddress"
                    :company="order.shoppingCart.shipping_company"
                    :country-code="order.shoppingCart.shipping_countryCodeAlpha2"
                    :city="order.shoppingCart.shipping_city"
                    :state="order.shoppingCart.shipping_state"
                    :zip="order.shoppingCart.shipping_postalCode" />
            </div>

            <div class="mbl mrxl inlineBlock vat">
                <div class="fwb">{{ $t('Payment method') }}:</div>
                <div>
                    <payment-type-display :card-type="creditCardType"
                                        :last-four="order.transaction.creditCard.last4"
                                        :payer-email="order.transaction.customer.email"></payment-type-display>
                </div>
            </div>

            <div class="mbl inlineBlock vat">
                <div class="fwb">{{ $t('Order summary') }}:</div>
                <div>
                    <cart-totals-table :cart="order.shoppingCart"
                                    :show-shipping-cost="true"
                                    :show-sales-tax="true"
                                    label-class="tal"></cart-totals-table>
                </div>
            </div>
        </div>

        <cart-items
            :shopping-cart="order.shoppingCart"
            :allow-edit="false" />
    </div>
</template>
