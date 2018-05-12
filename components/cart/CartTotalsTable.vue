<script>
    export default {
        props: {
            showShippingCost: {
                type: Boolean,
                default: false
            },

            showSalesTax: {
                type: Boolean,
                default: false
            },

            cart: {
                type: Object,
                required: true
            },

            labelClass: {
                type: String,
                default: 'tar'
            }
        }
    }
</script>


<template>
    <div v-if="cart.num_items">
        <!-- subtotal -->
        <div class="displayTableRow">
            <div class="displayTableCell prl" :class="labelClass">
                {{ $t('Total before tax') }}
                <span class="nowrap">({{ cart.num_items }} {{ $tc('items', cart.num_items) }})</span>:
            </div>
            <div class="displayTableCell tar mono">{{ $n(cart.sub_total, 'currency') }}</div>
        </div>

        <!-- shipping -->
        <div class="displayTableRow" v-if="showShippingCost">
            <div class="displayTableCell prl" :class="labelClass">{{ $t('Shipping') }}:</div>
            <div class="displayTableCell tar mono">{{ $n(cart.shipping_total, 'currency') }}</div>
        </div>

        <!-- sales tax -->
        <div class="displayTableRow" v-if="showSalesTax">
            <div class="displayTableCell prl" :class="labelClass">{{ $t('Estimated tax') }}:</div>
            <div class="displayTableCell tar mono">{{ $n(cart.sales_tax, 'currency') }}</div>
        </div>

        <!-- order total -->
        <div class="displayTableRow" v-if="showShippingCost && showSalesTax">
            <div class="displayTableCell prl colorGreen fs16" :class="labelClass">{{ $t('Order total') }}:</div>
            <div class="displayTableCell tar colorGreen fs16 mono">{{ $n(cart.grand_total, 'currency') }}</div>
        </div>
    </div>
</template>