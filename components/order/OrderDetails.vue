<script>
import payment_mixin from '@/mixins/payment_mixin';


export default {
    props: {
        order: {
            type: Object,
            required: true
        }
    },

    components: {
        PaymentTypeDisplay: () => import('@/components/payment/PaymentTypeDisplay'),
        CartTotalsTable: () => import('@/components/cart/CartTotalsTable'),
        CartShippingAddressDisplay: () => import('@/components/cart/CartShippingAddressDisplay'),
        CartItems: () => import('@/components/cart/CartItems')
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
            <!-- ordered on -->
            <div class="formRow">
                <label class="fwb nowrap">{{ $t('Ordered on') }}:</label>
                <span class="widthAll">
                    {{ order.created_at | format8601 }}
                </span>
            </div>

            <!-- order -->
            <div class="formRow">
                <label class="fwb nowrap">{{ $t('Order') }}:</label>
                <span class="widthAll">
                    {{ order.id }}
                </span>
            </div>

            <!-- payment method -->
            <div class="formRow">
                <label class="fwb nowrap">{{ $t('Payment method') }}:</label>
                <span class="widthAll">
                    <payment-type-display :payment="order" />
                </span>
            </div>
        </div>

        <div>
            <div class="mbl mrxl inlineBlock vat">
                <div class="fwb nowrap">{{ $t('Shipping to') }}:</div>
                <cart-shipping-address-display
                            :shopping-cart="order.shoppingCart" />
            </div>

            <div class="mbl inlineBlock vat">
                <div class="fwb nowrap">{{ $t('Order summary') }}:</div>
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


<style lang="scss">
@import "~assets/css/components/_formRow.scss";
</style>
