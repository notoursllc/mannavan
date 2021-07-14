<script>
import { FigContent } from '@notoursllc/figleaf';

export default {
    components: {
        FigContent,
        PageTitle: () => import('@/components/PageTitle'),
        ConditionsOfUseDisplay: () => import('@/components/ConditionsOfUseDisplay')
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

        <div class="priv">
            <conditions-of-use-display />
        </div>
    </fig-content>
</template>
