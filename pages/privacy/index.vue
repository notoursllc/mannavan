<script>
import PrivacyDisplay from '@/components/PrivacyDisplay'
import app_mixin from '@/mixins/app_mixin'

export default {
    components: {
        PrivacyDisplay
    },

    mixins: [
        app_mixin
    ],

    created() {
        this.$store.dispatch('ui/pageTitle', this.$t('Privacy Notice'));
    },

    head() {
        return {
            title: this.$t('Privacy Notice'),
            meta: [
                { vmid: 'description', name: 'description', content: `Privacy Notice for ${this.getSiteName()}` }
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
