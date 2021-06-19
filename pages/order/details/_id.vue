<script>
import CartReceipt from '@/components/cart/CartReceipt';
import PageTitle from '@/components/PageTitle';
import {
    FigCheckoutWrapper
} from '@notoursllc/figleaf';

export default {
    components: {
        CartReceipt,
        PageTitle,
        FigCheckoutWrapper
    },

    head() {
        return {
            title: this.$t('Order Details'),
            meta: [
                { vmid: 'description', name: 'description', content: `Order Details for your order from ${this.$store.state.ui.siteName}` }
            ]
        };
    }
};
</script>


<template>
    <fig-checkout-wrapper class="px-4">
        <page-title>{{ $t('Order Details') }}</page-title>

        <cart-receipt
            :cart-id="$route.params.id"
            @found="onCartFound" />
    </fig-checkout-wrapper>
</template>



