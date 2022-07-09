<script>
import PageTitle from '@/components/PageTitle';
import PrivacyDisplay from '@/components/PrivacyDisplay';
import ContentCard from '@/components/ContentCard.vue';
import { FigContent } from '@notoursllc/figleaf';

export default {
    components: {
        PageTitle,
        PrivacyDisplay,
        ContentCard,
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

        <content-card>
            <div class="priv">
                <privacy-display />
            </div>
        </content-card>
    </fig-content>
</template>
