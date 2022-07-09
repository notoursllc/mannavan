<script>
import PageTitle from '@/components/PageTitle';
import ContentCard from '@/components/ContentCard.vue';
import {
    FigContent,
    FigAddress
} from '@notoursllc/figleaf';

export default {
    components: {
        PageTitle,
        ContentCard,
        FigContent,
        FigAddress
    },

    head() {
        return {
            title: this.$t('Returns / Exchanges'),
            meta: [
                { vmid: 'description', name: 'description', content: `Returns and Exchanges for your order at ${this.$store.state.ui.siteName}` }
            ]
        };
    },

    computed: {
        returnsEmailAddress() {
            return this.$store.state.ui.infoEmailAddress;
        },

        company() {
            return this.$config.shippingFromCompany;
        },

        address1() {
            return this.$config.shippingFromAddress1;
        },

        city() {
            return this.$config.shippingFromCity;
        },

        state() {
            return this.$config.shippingFromState;
        },

        zip() {
            return this.$config.shippingFromZip;
        },

        country() {
            return this.$config.shippingFromCountryCode;
        }
    }
};
</script>


<template>
    <fig-content size="lg">
        <page-title>{{ $t('Returns / Exchanges') }}</page-title>

        <content-card>
            {{ $t('returns_help')}}

            <div class="mt-6">
                <div class="font-bold">{{ $t('To return an item:')}}</div>

                <ol class="mt-4 orderedList">
                    <li>{{ $t('Include a copy of the packing slip or confirmation email from your order.') }}</li>
                    <li>
                        <div class="pb-1 pt-2 font-semibold">{{ $t('Mail your return to:') }}</div>
                        <div class="bg-white rounded px-6 py-2 inline-block">
                            <fig-address
                                :company="company"
                                :street-address="address1"
                                :city="city"
                                :state="state"
                                :zip="zip + ''"
                                :country-code="country" />
                        </div>
                    </li>
                    <li>{{ $t('We will issue your refund when the return is received.') }}</li>
                </ol>
            </div>

            <div class="mt-6">
                <h2 class="font-bold">{{ $t('Questions?') }}</h2>
                <div><a :href="`mailto:${returnsEmailAddress}`">{{ returnsEmailAddress }}</a></div>
            </div>
        </content-card>
    </fig-content>
</template>

<style scoped>
.orderedList {
    margin: 0 20px;
}
.orderedList li {
    padding-left: 10px;
    margin-bottom: 10px;
}
</style>


