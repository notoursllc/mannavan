<script>
export default {
    components: {
        PageTitle: () => import('@/components/PageTitle'),
        ConditionsOfUseDisplay: () => import('@/components/ConditionsOfUseDisplay')
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
    <div>
        <page-title>{{ $t('Conditions of Use') }}</page-title>

        <div class="pageContainerMax priv">
            <conditions-of-use-display />
        </div>
    </div>
</template>


<style lang="scss">
    @import "~assets/css/components/_privacy.scss";
</style>
