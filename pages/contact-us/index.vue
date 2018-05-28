<script>
import SiteName from '@/components/SiteName'
import app_mixin from '@/mixins/app_mixin'

export default {
    components: {
        SiteName
    },

    mixins: [
        app_mixin
    ],

    created() {
        this.$store.dispatch('ui/pageTitle', this.$t('Contact Us!'));
    },

    head() {
        return {
            title: this.$t('Contact Us!'),
            meta: [
                { vmid: 'description', name: 'description', content: `Contact us` }
            ]
        }
    }
}
</script>


<template>
    <div class="pageContainerMax priv">
TODO
    </div>
</template>
