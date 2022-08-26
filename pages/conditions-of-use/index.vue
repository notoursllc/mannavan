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

                <div class="mt-6">
                    By accessing, viewing, or using the content, material, products, or services available on or through the Site,
                    you certify that you have read, understand, and agree to be legally bound by these Terms, as well as our
                    Privacy Policy, each of which is incorporated by reference as if fully set forth herein. You further certify that
                    you are 13 years of age or older and that you have all the necessary rights, power and authority to enter into
                    this Agreement and perform the obligations set forth under this Agreement. You understand and agree that your use
                    of the Site or any content, material, products or services made available on or through the Site (collectively,
                    the "Services") signifies that you fully accept and agree to these Terms of Use.
                </div>

                <h2>1. Registration</h2>
                In order to access certain content, material, products or services on the Site, you may be asked to register and
                create an account. As part of the registration process, you may be asked to click to agree to these Terms, and may then
                be asked to select or submit a user name and password. You may also be required to provide us with certain information
                about yourself including some types of personally identifiable information, including your legal name, phone number,
                address, email address, gender, and age. You are responsible for ensuring that your password and account login are kept
                secret, safe, and secure at all times. <brand-name /> will not be held responsible or liable for any misuse of your account
                in the event that a third party has access to and uses your password and account login in any way.


                <div class="mt-6">
                    When placing an order through the Site, you will be required to provide other personal information, such as
                    shipping address, billing address, and payment details. Additional information may be collected by <brand-name />
                    or its third party providers at this time for security and anti-fraud purposes. You represent that the personal
                    information you provide to us via the Site is true, valid, complete and up-to-date in all respects, and you confirm
                    that you are the person referred to in the shipping (unless the item is a gift) and billing information provided. Should
                    any of the information you provide on the Site change, please login to your account and update such information directly
                    on the Site.
                </div>

                <!--  -->

                <div class="mt-6">
                    Any personal information that you provide to us via the Site is subject to our Privacy Policy.
                </div>

                <h2>2. Purchases</h2>
                Some products or services made available through the Site may be available for purchase. By purchasing products or
                services made available through the Site, you represent that you have reached the age of majority (which in most states
                is 18 years old) and have the legal capacity to enter into a contract. If you are under the age of majority or cannot
                lawfully enter into a contract, you must have your parent or guardian review these Terms and the Privacy Policy, and
                register or place an order on your behalf. <brand-name /> may use a third party payment processor to process credit card
                transactions made through the Site. You are also responsible for paying any governmental taxes imposed in connection with
                use of the Site or the purchase or any products or services made available through the Site, including sales, use, and excise
                taxes (excluding only taxes on <brand-name />’s net income). To the extent that <brand-name /> is obligated to collect such
                taxes, the applicable tax will be added to your billing account. All sales are subject to our shipping and return policies,
                which shall be made available to you on the Site or other delivered to you with your purchased goods. All refunds are in
                <brand-name />’s sole discretion.

                <h2>3. General Restrictions on Use</h2>
                You agree to use the Site and the Services only for purposes that are permitted by these Terms of Use and in compliance
                with all applicable laws, regulations, and generally accepted practices or guidelines in the relevant jurisdictions. You
                may only use the Site and Services for your non-commercial, non-exclusive, non-assignable, non-transferable and limited
                personal use, and for no other purposes.

                <div class="mt-6">
                    You will not (and will not attempt to):
                </div>

                <ul>
                    <li>Access any of the Services by any means other than through the interface that is provided by <brand-name />;</li>
                    <li>Gain unauthorized access to <brand-name />’s computer system or engage in any activity that interferes with the performance
                        of, or impairs the functionality or security of the Site, the Services, <brand-name />’s networks and computer systems;</li>
                    <li>Access any of the Site or the Services through any automated means or with any automated features or devices (including use
                        of scripts or web crawlers);</li>
                    <li>Access or collect any personally identifiable information, including any names, email addresses or other such information
                        for any purpose, including, without limitation, commercial purposes;</li>
                    <li>Reproduce, duplicate, copy, sell, trade, or resell any aspect of the Site or the Services for any purpose; and</li>
                    <li>Reproduce, duplicate, copy, sell, trade or resell any products or services bearing any trademark, service mark, trade name,
                        logo or service mark owned by <brand-name /> in a way that is likely or intended to cause confusion about the owner or authorized
                        user of such marks, names or logos.</li>
                </ul>


                <!--  -->


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
