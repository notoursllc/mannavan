<script>
import PageTitle from '@/components/PageTitle';
import PrivacyDisplay from '@/components/PrivacyDisplay';

export default {
    components: {
        PageTitle,
        PrivacyDisplay
    },

    head() {
        return {
            title: this.$t('Privacy Notice'),
            meta: [
                { vmid: 'description', name: 'description', content: `Privacy Notice for ${this.$store.state.ui.siteName}` }
            ]
        };
    }
};
</script>


<template>
    <div>
        <page-title>{{ $t('Privacy Notice') }}</page-title>

        <div class="pageContainerMax priv">
            <privacy-display />
        </div>
    </div>
</template>
