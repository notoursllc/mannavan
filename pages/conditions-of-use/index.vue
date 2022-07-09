<script>
import ContentCard from '@/components/ContentCard.vue';
import { FigContent } from '@notoursllc/figleaf';
import PageTitle from '@/components/PageTitle';
import ConditionsOfUseDisplay from '@/components/ConditionsOfUseDisplay';

export default {
    components: {
        ContentCard,
        FigContent,
        PageTitle,
        ConditionsOfUseDisplay
    },

    head() {
        return {
            title: this.$t('Conditions of Use'),
            meta: [
                { vmid: 'description', name: 'description', content: `Conditions of Use for ${this.$store.state.ui.siteName}` }
            ]
        };
    }
};
</script>


<template>
    <fig-content size="lg">
        <page-title>{{ $t('Conditions of Use') }}</page-title>

        <content-card>
            <div class="priv">
                <conditions-of-use-display />
            </div>
        </content-card>
    </fig-content>
</template>
