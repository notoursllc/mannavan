<script>
import {
    FigTooltip,
    FigIcon,
    FigIconLabel
} from '@notoursllc/figleaf';

export default {
    name: 'CartTotalsTable',

    components: {
        FigTooltip,
        FigIcon,
        FigIconLabel
    },

    props: {
        cart: {
            type: Object,
            default() {
                return {};
            }
        },

        shipping: {
            type: Boolean,
            default: false
        },

        shippingOnNextStep: {
            type: Boolean,
            default: false
        },

        salesTax: {
            type: Boolean,
            default: false
        },

        salesTaxOnNextStep: {
            type: Boolean,
            default: false
        },

        labelClass: {
            type: String,
            default: null
        }
    },

    computed: {
        numCartItems() {
            return this.cart.num_items;
        }
    }
};
</script>


<template>
    <div v-if="numCartItems" class="table w-full text-black">
        <!-- subtotal -->
        <div class="table-row">
            <div class="table-cell pr-3" :class="labelClass">
                <fig-icon-label>
                    {{ $t('Subtotal') }}
                    <template slot="right">
                        <fig-tooltip placement="top">
                            <fig-icon
                                slot="toggler"
                                icon="info-circle"
                                :width="16"
                                :height="16" />
                            {{ $t('subtotal_tooltip') }}
                        </fig-tooltip>
                    </template>
                </fig-icon-label>
            </div>
            <div class="table-cell text-right font-mono">{{ $n(cart.sub_total/100, 'currency') }}</div>
        </div>

        <!-- shipping -->
        <div class="table-row" v-if="shipping || shippingOnNextStep">
            <div class="table-cell pr-3" :class="labelClass">
                <fig-icon-label>
                    {{ $t('Shipping') }}
                    <div
                        slot="right"
                        v-if="shippingOnNextStep">
                        <fig-tooltip placement="top">
                            <fig-icon
                                slot="toggler"
                                icon="info-circle"
                                :width="16"
                                :height="16" />
                            {{ $t('Shipping cost will be displayed during checkout') }}
                        </fig-tooltip>
                    </div>
                </fig-icon-label>
            </div>
            <div class="table-cell text-right font-mono">
                <template v-if="shippingOnNextStep">--</template>
                <template v-else>{{ $n(cart.shipping_total/100, 'currency') }}</template>
            </div>
        </div>

        <!-- sales tax -->
        <div class="table-row" v-if="salesTax || salesTaxOnNextStep">
            <div class="table-cell pr-3" :class="labelClass">
                <fig-icon-label>
                    {{ $t('Estimated tax') }}
                    <div
                        slot="right"
                        v-if="salesTaxOnNextStep">
                        <fig-tooltip placement="top">
                            <fig-icon
                                slot="toggler"
                                icon="info-circle"
                                :width="16"
                                :height="16" />
                            {{ $t('Sales tax will be displayed during checkout') }}
                        </fig-tooltip>
                    </div>
                </fig-icon-label>
            </div>
            <div class="table-cell text-right font-mono">
                <template v-if="salesTaxOnNextStep">--</template>
                <template v-else>{{ $n(cart.sales_tax/100, 'currency') }}</template>
            </div>
        </div>

        <!-- order total -->
        <div class="table-row" v-if="shipping && salesTax">
            <div class="table-cell pr-3 pt-2 font-medium" :class="labelClass">{{ $t('Order total') }}:</div>
            <div class="table-cell text-right text-green-700 pt-2 font-medium font-mono">{{ $n(cart.grand_total/100, 'currency') }}</div>
        </div>
    </div>
</template>
