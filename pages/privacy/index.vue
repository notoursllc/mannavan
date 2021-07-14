<script>
import PageTitle from '@/components/PageTitle';
import PrivacyDisplay from '@/components/PrivacyDisplay';
import { FigContent } from '@notoursllc/figleaf';

export default {
    components: {
        PageTitle,
        PrivacyDisplay,
        FigContent
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
    <fig-content size="lg">
        <page-title>{{ $t('Privacy Notice') }}</page-title>

        <div class="priv">
            <privacy-display />
        </div>
    </fig-content>
</template>
