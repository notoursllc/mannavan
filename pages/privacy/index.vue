<script>
export default {
    components: {
        PageTitle: () => import('@/components/PageTitle'),
        PrivacyDisplay: () => import('@/components/PrivacyDisplay')
    },

    head() {
        return {
            title: this.$t('Privacy Notice'),
            meta: [
                { vmid: 'description', name: 'description', content: `Privacy Notice for ${this.$store.state.ui.siteName}` }
            ]
        }
    }
}
</script>


<template>
    <div>
        <page-title>
            <fig-icon icon="lock" width="26" height="26" stroke-width="1px" />
            {{ $t('Privacy Notice') }}
        </page-title>

        <div class="pageContainerMax priv">
            <privacy-display />
        </div>
    </div>
</template>
