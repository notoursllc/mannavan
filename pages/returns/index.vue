<script>
export default {
    components: {
        PageTitle: () => import('@/components/PageTitle'),
    },

    computed: {
        returnsEmailAddress() {
            return this.$store.state.ui.infoEmailAddress;
        }
    },

    head() {
        return {
            title: this.$t('Returns / Exchanges'),
            meta: [
                { vmid: 'description', name: 'description', content: `Returns and Exchanges for your order at ${this.$store.state.ui.siteName}` }
            ]
        }
    }
}
</script>


<template>
    <div>
        <page-title>{{ $t('Returns / Exchanges') }}</page-title>

        <div class="pageContainerMax">
            <!-- {{ this.$t('returns_help')}}: -->
            Items can be returned within 30 days of delivery as long as they are unwashed, unworn, and undamaged. Please note that shipping charges are non-refundable.

            <div class="mtl">
                <div class="fwb">To return an item:</div>

                <ol class="mts orderedList">
                    <li>Include a copy of the packing slip or confirmation email from your order.</li>
                    <li>Mail your return to:<br/>
                    TBD Mailing address</li>
                    <li>We will issue your refund when the return is received</li>
                </ol>

                <div class="mtl">
                    <h2 class="fwb">Questions?</h2>
                    <div><a :href="`mailto:${returnsEmailAddress}`">{{ returnsEmailAddress }}</a></div>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.orderedList {
    margin: 0 20px;

    li {
        padding-left: 10px;
        margin-bottom: 10px;
    }
}
</style>


