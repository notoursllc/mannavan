<script>
import app_mixin from '@/mixins/app_mixin';

export default {
    mixins: [
        app_mixin
    ],

    head() {
        return {
            title: this.$t('Contact BreadVan'),
            meta: [
                { vmid: 'description', name: 'description', content: 'Contact us' }
            ]
        };
    }
};
</script>


<template>
    <div class="pageContainerMax priv">
        <div class="tac">
            <fig-icon icon="mail" stroke-width="1px" width="80" height="80" />
            <div class="mts fs24">{{ $t('We want to hear from you!') }}</div>
            <div class="fs16">{{ $t("We'll get back to you within 1 business day.") }}</div>
            <div class="fs20 mtm"><a :href="`mailto:${$config.emailInfo}`">{{ $config.emailInfo }}</a></div>
        </div>
    </div>
</template>
