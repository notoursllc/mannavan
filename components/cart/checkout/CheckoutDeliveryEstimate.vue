<script>
import { FigUseUtils } from '@notoursllc/figleaf';

const utils = FigUseUtils();

export default {
    name: 'CheckoutDeliveryEstimate',

    props: {
        arrivalDate: {
            type: String
        },

        serviceType: {
            type: String
        }
    },

    computed: {
        estimateDisplay() {
            const startPadding = utils.parseInt2(this.$config.shippinEstimateArrivalStartIncrement, 0);
            const endPadding = utils.parseInt2(this.$config.shippingEstimateArrivalEndRange, 4);

            // start day calculation
            let from = 1;
            if(this.arrivalDate) {
                from = utils.daysFromNow( new Date(this.arrivalDate) );

                if(from < 1) {
                    from = 1;
                }
            }
            from += startPadding;

            // end day calculation
            const to = from + endPadding;
            if(to > from) {
                return this.$t('{from}-{to} business days', {from, to});
            }

            return this.$t('{num} business days', {num: from});
        }
    }
}
</script>


<template>
    <span>
        {{ estimateDisplay }}
        <span v-if="serviceType" class="pl-1">({{ serviceType }})</span>
    </span>
</template>
