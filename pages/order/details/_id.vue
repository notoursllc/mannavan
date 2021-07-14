<script>
import CartReceipt from '@/components/cart/CartReceipt';
import PageTitle from '@/components/PageTitle';
import { FigContent } from '@notoursllc/figleaf';

export default {
    components: {
        CartReceipt,
        PageTitle,
        FigContent
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
    <fig-content size="lg">
        <page-title>{{ $t('Order Details') }}</page-title>

        <cart-receipt
            :cart-id="$route.params.id" />
    </fig-content>
</template>



