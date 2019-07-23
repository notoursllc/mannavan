<script>
export default {
    components: {
        PrivacyDisplay: () => import('@/components/PrivacyDisplay')
    },

    created() {
        this.$store.dispatch('ui/pageTitle', this.$t('Privacy Notice'));
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
    <div class="pageContainerMax priv">
        <privacy-display />
    </div>
</template>

<style lang="scss">
    @import "~assets/css/components/_privacy.scss";
</style>
