<script>
import PaymentTypeDisplay from '@/components/PaymentTypeDisplay'
import CartTotalsTable from '@/components/cart/CartTotalsTable'
import AddressDisplay from '@/components/AddressDisplay'
import OrderCartItems from '@/components/order/OrderCartItems'
import order_mixin from '@/mixins/order_mixin';


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
        OrderCartItems,
        AddressDisplay
    },

    mixins:[
        order_mixin
    ],

    computed: {
        cardType: function() {
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
            <div class="displayTableRow">
                <div class="displayTableCell prm">{{ $t('Ordered on') }}:</div>
                <div class="displayTableCell">{{ order.created_at | format8601 }}</div>
            </div>

            <div class="displayTableRow">
                <div class="displayTableCell prm">{{ $t('Order') }}:</div>
                <div class="displayTableCell">{{ order.id }}</div>
            </div>
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
                    <payment-type-display :card-type="cardType"
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

        <order-cart-items :cart-items="order.shoppingCart.cart_items" />
    </div>
</template>
