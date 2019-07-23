<script>
export default {
    components: {
        ConditionsOfUseDisplay: () => import('@/components/ConditionsOfUseDisplay')
    },

    created() {
        this.$store.dispatch('ui/pageTitle', this.$t('Conditions of Use'));
    },

    head() {
        return {
            title: this.$t('Conditions of Use'),
            meta: [
                { vmid: 'description', name: 'description', content: `Conditions of Use for ${this.$store.state.ui.siteName}` }
            ]
        }
    }
}
</script>


<template>
    <div class="pageContainerMax priv">
        <conditions-of-use-display />
    </div>
</template>


<style lang="scss">
    @import "~assets/css/components/_privacy.scss";
</style>
