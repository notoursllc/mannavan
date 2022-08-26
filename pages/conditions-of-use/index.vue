<script>
import ContentCard from '@/components/ContentCard.vue';
import { FigContent } from '@notoursllc/figleaf';
import PageTitle from '@/components/PageTitle';
import BrandName from '@/components/BrandName';

export default {
    name: 'ConditionsOfUse',

    components: {
        ContentCard,
        FigContent,
        PageTitle,
        BrandName
    },

    data() {
        return {
            siteUrl: this.$store.state.ui.siteUrlShort,
            infoEmailAddress: this.$store.state.ui.infoEmailAddress
        }
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
                Welcome to the <brand-name /> website, operated by Not Ours, LLC. (<brand-name />) and located at
                {{ siteUrl }} (the "Site"). The following terms and conditions (“Terms”) govern your use of the Site.
            </div>
        </content-card>
    </fig-content>
</template>


<style>
.priv h2 {
    font-weight: bold;
    font-size: 20px;
    line-height: 35px;
    margin-top: 20px;
}

.priv ul {
    margin: 14px 0 14px 28px;
    padding-left: 0;
}

.priv ul li {
    list-style: disc;
}
</style>
