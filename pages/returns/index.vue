<script>
import PageHeader from '@/components/PageHeader'
import app_mixin from '@/mixins/app_mixin'

export default {
    components: {
        PageHeader
    },

    mixins: [
        app_mixin
    ],

    data: function() {
        return {
            returnsEmailAddress: this.getHelpEmailAddress()
        }
    },

    created() {
        this.$store.dispatch('ui/pageTitle', this.$t('Returns / Exchanges'));
    },

    head() {
        return {
            title: this.$t('Returns / Exchanges'),
            meta: [
                { vmid: 'description', name: 'description', content: `Returns and Exchanges for your order at ${this.getSiteName()}` }
            ]
        }
    }
}
</script>


<template>
    <div class="pageContainerMax tac">
        {{ this.$t('returns_help')}}:

        <div class="mts fs20">
            <a :href="`mailto:${returnsEmailAddress}`">{{ returnsEmailAddress }}</a>
        </div>
    </div>
</template>


