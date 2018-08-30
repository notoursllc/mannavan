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
    ]
}
</script>

<template>
    <div>
        <div class="mbl">
            <div class="displayTableRow">
                <div class="displayTableCell prm">{{ $t('Ordered on') }}:</div>
                <div class="displayTableCell">{{ order.created | format8601 }}</div>
            </div>

            <div class="displayTableRow">
                <div class="displayTableCell prm">{{ $t('Order') }}:</div>
                <div class="displayTableCell">{{ order.transaction.id }}</div>
            </div>
        </div>

        <div>
            <div class="mbl mrxl inlineBlock vat">
                <div class="fwb">{{ $t('Shipping to') }}:</div>
                <address-display
                    :first-name="order.shipping.firstName"
                    :last-name="order.shipping.lastName"
                    :street-address="order.shipping.streetAddress"
                    :extended-address="order.shipping.extendedAddress"
                    :company="order.shipping.company"
                    :country-code="order.shipping.countryCodeAlpha2"
                    :city="order.shipping.locality"
                    :state="order.shipping.region"
                    :zip="order.shipping.postalCode" />
            </div>

            <div class="mbl mrxl inlineBlock vat">
                <div class="fwb">{{ $t('Payment method') }}:</div>
                <div>
                    <payment-type-display :card-type="cardType"
                                        :last-four="order.transaction.payment.last4"
                                        :payer-email="order.transaction.payment.payerEmail"></payment-type-display>
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
