<script>
import PageTitle from '@/components/PageTitle';
import { FigContent } from '@notoursllc/figleaf';

export default {
    components: {
        PageTitle,
        FigContent
    },

    head() {
        return {
            title: this.$t('Returns / Exchanges'),
            meta: [
                { vmid: 'description', name: 'description', content: `Returns and Exchanges for your order at ${this.$store.state.ui.siteName}` }
            ]
        };
    },

    computed: {
        returnsEmailAddress() {
            return this.$store.state.ui.infoEmailAddress;
        }
    }
};
</script>


<template>
    <fig-content size="lg">
        <page-title>{{ $t('Returns / Exchanges') }}</page-title>

        <div>
            <!-- {{ this.$t('returns_help')}}: -->
            Items can be returned within 30 days of delivery as long as they are unwashed, unworn, and undamaged. Please note that shipping charges are non-refundable.

            <div class="mt-6">
                <div class="font-bold">To return an item:</div>

                <ol class="mt-4 orderedList">
                    <li>Include a copy of the packing slip or confirmation email from your order.</li>
                    <li>
                        Mail your return to:<br>
                        TBD Mailing address
                    </li>
                    <li>We will issue your refund when the return is received</li>
                </ol>
            </div>

            <div class="mt-6">
                <h2 class="font-bold">Questions?</h2>
                <div><a :href="`mailto:${returnsEmailAddress}`">{{ returnsEmailAddress }}</a></div>
            </div>
        </div>
    </fig-content>
</template>

<style scoped>
.orderedList {
    margin: 0 20px;
}
.orderedList li {
    padding-left: 10px;
    margin-bottom: 10px;
}
</style>


