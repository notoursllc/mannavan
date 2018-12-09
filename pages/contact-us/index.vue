<script>
import app_mixin from '@/mixins/app_mixin'
import IconEnvelope from '@/components/icons/IconEnvelope'

export default {
    components: {
        IconEnvelope
    },

    mixins: [
        app_mixin
    ],

    computed: {
        emailAddress() {
            return process.env.EMAIL_INFO;
        }
    },

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

        <div class="tac">
            <icon-envelope icon-name="email" class-name="fillGrayLight" width="80px" />
            <div class="mts fs24">{{ $t('We want to hear from you!') }}</div>
            <div class="fs16">{{ $t("We'll get back to you within 1 business day.") }}</div>
            <div class="fs20 mtm"><a :href="`mailto:${emailAddress}`">{{ emailAddress }}</a></div>
        </div>

    </div>
</template>
