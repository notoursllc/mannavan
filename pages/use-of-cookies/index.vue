<script>
import PageTitle from '@/components/PageTitle';
import ContentCard from '@/components/ContentCard.vue';
import { FigContent } from '@notoursllc/figleaf';

export default {
    components: {
        PageTitle,
        ContentCard,
        FigContent
    },

    head() {
        return {
            title: this.$t('Use of Cookies'),
            meta: [
                { vmid: 'description', name: 'description', content: `Conditions of Use for ${this.$store.state.ui.siteName}` }
            ]
        };
    }
};
</script>


<template>
    <fig-content size="lg">
        <page-title>{{ $t('Use of Cookies') }}</page-title>

        <content-card>
            <h2 class="font-bold">What is a cookie?</h2>
            <div class="quote mt-4">
                A cookie is a piece of information in the form of a very small text file that is placed on an internet user's hard drive.
                It is generated by a web page server, which is basically the computer that operates a web site. The information the cookie contains
                is set by the server and it can be used by that server whenever the user visits the site. A cookie can be thought of as an
                internet user's identification card, which tell a web site when the user has returned.
                <div>- <a href="http://www.aboutcookies.org/" target="_blank" class="text-sm">http://www.aboutcookies.org/</a></div>
            </div>

            <div class="mt-6">
                Our site uses cookies to keep track of what items you have in your shopping cart and to remember that for when you return to our site.
                Without these cookies the site would forget which items you have placed in your shopping cart and you would not be able to purchase any
                products from our online store.
            </div>

            <div class="mt-4">We may also collect and summarize customer information in a format that no longer identifies the individual for statistical purposes.</div>
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

.priv p {
    margin-top: 15px;
}

.priv ul {
    margin: 14px 0 14px 28px;
    padding-left: 0;
}

.priv ul li {
    list-style: disc;
}
</style>
