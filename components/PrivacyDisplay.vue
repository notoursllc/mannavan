<script>
import SiteName from '@/components/SiteName'
import app_mixin from '@/mixins/app_mixin'

export default {
    name: 'PrivacyDisplay',

    components: {
        SiteName
    },

    mixins: [
        app_mixin
    ],

    data: function() {
        return {
            helpEmailAddress: this.getHelpEmailAddress(),
            brandName: this.getBrandName()
        }
    }
}
</script>

<template>
    <div class="pageContainerMax priv">
        We know how important it is to protect your personal information. We want to make every customer experience safe and secure.
        In keeping with that goal, we have developed this Privacy Notice to outline our guidelines for the collection and use of personal information.

        <h2>WHO IS <site-name :uppercase="true" />?</h2>
        <div>
            <site-name /> is the operating name of Not Ours, LLC. This policy applies to <site-name /> and
            all of its named operations and divisions ("{{ brandName }}", "we", "our" or "us").
        </div>

        <h2>WHAT INFORMATION DOES <site-name :uppercase="true" /> COLLECT AND HOW IS IT USED?</h2>
        <div>
            At <site-name />, we collect two types of information: personal information and non-personal information. With your
            consent we may use your personal information for a number of different purposes, for example to:

            <ul>
                <li>fulfill requests for products, services or information</li>
                <li>provide customer services</li>
                <li>administer contests or promotions</li>
                <li>offer new products and services</li>
                <li>measure and improve the effectiveness of our Web Sites or our marketing endeavors</li>
                <li>tailor our online or on-site offerings to your preferences</li>
            </ul>

            <div class="mtl">
                We may also collect and summarize customer information in a format that no longer identifies the individual for statistical purposes.
            </div>

            <div class="mtl">
                Personal information typically includes your name, address, phone number, and e-mail address. You can always choose
                not to provide us with any of your personal information. However, if you make this choice we may not be able to provide
                you with the product, service, or information that you requested.
            </div>

            <div class="mtl">
                Non-personal information does not identify you as an individual. For example, we may ask you for your postal code to assist us with
                planning our advertising and promotional efforts.
            </div>

            <div class="mtl">
                In no event will your personal information be used or disclosed for purposes other than those for which we collect it, except with your
                consent or as required by law.
            </div>
        </div>

        <h2>YOUR IMPLIED CONSENT</h2>
        <div>
            In some cases, your consent is implied if we ask you to provide personal information with a stated purpose. For example, we can only deliver
            the product you have purchased if you provide us with your address and phone number.
        </div>

        <h2>YOUR EXPRESS CONSENT</h2>
        <div>
            In other cases, we will ask you to give your express consent to use your personal information to advise you of products or services that may
            be of interest. You always have the opportunity to "opt out" of having your information used for this purpose.
        </div>

        <h2>WITHDRAWING YOUR CONSENT</h2>
        <div>
            If you have "opted in" or subscribed to one of our newsletters or mailing lists, we will always provide you the opportunity to "opt out" or
            unsubscribe. For example, each e-mail we send you will tell you how to decline further e-mail.
        </div>

        <h2>INFORMATION <site-name :uppercase="true" />COLLECTS FROM YOU</h2>
        <div>
            Listed here are some examples of the ways that we collect information about you and how we use it.
        </div>

        <h2>ON-SITE PURCHASES</h2>
        <div>
            When you purchase an <site-name /> product or service, you may need to provide us with contact and payment information
            (such as credit card information) so that we can process your request. Examples where we need contact information include
            delivery of products, mailing of your product, and rebate requests. If we collect this information, we may also ask for your
            consent to use this information to send you promotional information on products and services.
        </div>

        <h2>OUR WEB SITES</h2>
        <div>
            While using our Web Sites, you may be asked to voluntarily provide certain personal information (such as your name, email address,
            postal address, telephone number, or credit card information). We use this information to complete your transaction and to apply for
            access to certain special features and functions of the Web Sites. If you choose not to provide requested personal information, you
            will not be able to use certain features of the Web Sites and you will not be able to engage in transactions through the Web Sites.
        </div>

        <div class="mtl">
            With any of the services on our Web Sites, we may also use your personal information to contact and correspond with you and
            to respond to your inquiries. With your consent, we may send to you, from time to time, email or other communications regarding goods
            or services we believe will interest you.
        </div>

        <h2>PARTICIPATE IN SWEEPSTAKES, CONTEST, PROMOTIONS, OR SURVEYS</h2>
        <div>
            We may offer sweepstakes, contests, and other promotions (any, a "Promotion") through the Site, in the Stores or through one of our
            social media pages that may require registration. By participating in a Promotion, you are agreeing to official rules that govern that
            Promotion, which may contain specific requirements of you, including, allowing the sponsor of the Promotion to use your name, voice and
            likeness in advertising associated with the Promotion. If you choose to enter a Promotion, Personal Information may be disclosed to
            third parties or the public in connection with the administration of such Promotion, including in connection with winner selection,
            prize fulfillment, and as required by law or permitted by the Promotion's official rules, such as on a winner's list.
        </div>

        <h2>INFORMATION <site-name :uppercase="true" /> COLLECTS AUTOMATICALLY</h2>
        <div>
            Like many other Web sites, we automatically collect certain non-personal information regarding Web site users that does not identify you.
            Examples include the Internet Protocol (IP) address of your computer, the IP address of your Internet Service Provider, the date and time
            you access the Web Site, the Internet address of the Web site from which you linked directly to the Web Site, the operating system you
            are using, the sections of the Web Site you visit, the Web Site pages read and images viewed, and the content you download from the Web Site.
        </div>

        <div class="mtl">
            This non-personal information is used for Web Site and system administration purposes and to improve the Web Site.
        </div>

        <h2>COOKIES</h2>
        <div>
            The Web Site uses "cookies", a technology that installs a small amount of information on a Web Site user's computer to permit the
            Web Site to recognize future visits using that computer. Cookies enhance the convenience and use of the Web Site. For example, the
            information provided through cookies is used to recognize you as a previous user of the Web Site (so you do not have to enter your
            billing information every time), to offer personalized Web page content and information for your use, to track your activity at the
            Web Site, to respond to your needs, and to otherwise facilitate your Web Site experience. You may choose to decline cookies if your
            browser permits, but doing so may affect your use of the Web Site and your ability to access certain features of the Web Site or engage
            in transactions through the Web Site.
        </div>

        <h2>TRACKING INFORMATION</h2>
        <div>
            We may use non-personal information to compile tracking information reports regarding Web Site user demographics, Web Site traffic
            patterns, and Web Site purchases, and then provide those reports to advertisers and others. None of the tracking information in the
            reports can be connected to the identities or other personal information of individual users. We may also link tracking information
            with personal information voluntarily provided by Web Site users. Once such a link is made, all of the linked information is treated
            as personal information and will be used and disclosed only in accordance with this Policy.
        </div>

        <h2>LINKS TO OTHER WEB SITES</h2>
        <div>
            Our Web Site may contain links to other Web sites or Internet resources. When you click on one of those links you are contacting another
            Web site or Internet resource. <site-name :uppercase="true" /> has no responsibility or liability for or control over those other Web
            sites or Internet resources or their collection, use and disclosure of your personal information.
        </div>

        <div class="mtl">
            We encourage you to read the privacy policies of those other sites to learn how they collect and use information about you.
        </div>

        <h2>DOES <site-name :uppercase="true" /> DISCLOSE THE INFORMATION IT COLLECTS?</h2>
        <div>
            <site-name /> does not sell your personal information. However we may share your information with third parties acting
            on our behalf or as permitted or required by law.
        </div>

        <h2>DISCLOSURE TO SERVICE PROVIDERS</h2>
        <div>
            <site-name /> may share your personal information with certain service providers in order to provide products and services
            to you, to verify and validate information, and to address customer service matters. Examples of service providers include those shipping
            vendors who ships products to you on our behalf or third party emailing services newsletters, to name a few. To reduce the risk of fraud
            or misuse of personal information, <site-name /> may also verify your personal information, including but not limited
            to your address and credit card information, with third party service providers.
        </div>

        <div class="mtl">
            We will use reasonable efforts to ensure that your personal information is used in a manner that is consistent with this Policy. If you
            do not wish us to provide your personal information to those service providers, we may be unable to process your transaction.
        </div>

        <h2>INFORMATION YOU DISCLOSE PUBLICLY</h2>
        <div>
            User Content and Public Information. - The Site may permit you to submit ideas, photographs, videos, audio recordings, questions,
            comments, suggestions or other content, including Personal Information (collectively, "User Content"), on blogs and message boards,
            product reviews and other public forums. We or others may store, display, publish, distribute or otherwise use User Content online
            or offline in any media or format and may or may not attribute the User Content to you. Others may have access to this User Content
            and may have the ability to share it with third parties. Please note that {{ brandName }} does not control who will have access to the
            information that you choose to make public, and cannot ensure that parties who have access to such publicly available information
            will respect your privacy or keep it secure. We are not responsible for the privacy or security of any information that you make
            publicly available on the Site or what others do with information you share with them on the Site.
        </div>

        <div class="mtl">
            Name and Likeness. - We may also publish your name, voice, likeness and other Personal Information that is part of your User
            Content, and we may use the content, or any portion of the content, for advertising, marketing, publicity and promotional activities.
            By connecting with the {{ brandName }} brands through our social media pages or accounts, or by posting content using {{ brandName }}-created hashtags
            or other identifiers, you are providing your consent for {{ brandName }} to use any Personal Information or other content you submit or make
            available through such sites for marketing and promotional purposes, including, but not limited to, incorporation into our marketing
            materials, without further notice or compensation.
        </div>

        <h2>LEGAL DISCLOSURE</h2>
        <div>
            <site-name /> may disclose your information without your knowledge or consent in the following situations only:

            <ul>
                <li>to a lawyer representing the organization</li>
                <li>to collect a debt the individual owes to the organization</li>
                <li>to comply with a subpoena, a warrant or an order made by a court or other body with appropriate jurisdiction</li>
                <li>to the Financial Transactions and Reports Analysis Centre of Canada (FINTRAC) as required by the Proceeds of Crime (Money Laundering)
                    and Terrorist Financing Act</li>
                <li>to a government institution that has requested the information, identified its lawful authority to obtain the information, and
                    indicates that disclosure is for the purpose of enforcing, carrying out an investigation, or gathering intelligence relating to
                    any federal, provincial or foreign law; or suspects that the information relates to national security, the defence of Canada or
                    the conduct of international affairs; or is for the purpose of administering any federal or provincial law</li>
                <li>to an investigative body named in the Regulations of the Act or government institution on the organization’s initiative when the
                    organization has reasonable grounds to believe that the information concerns a breach of an agreement, or a contravention of a
                    federal, provincial, or foreign law, or suspects the information relates to national security, the defence of Canada or the
                    conduct of international affairs</li>
                <li>if made by an investigative body for the purposes related to the investigation of a breach of an agreement or a contravention of
                    a federal or provincial law</li>
                <li>in an emergency threatening an individual’s life, health, or security (the organization must inform the individual of the disclosure)</li>
                <li>for statistical, scholarly study or research (the organization must notify the Privacy Commissioner before disclosing the information)</li>
                <li>to an archival institution</li>
                <li>20 years after the individual’s death or 100 years after the record was created</li>
                <li>if it is publicly available as specified in the regulations; or if required by law</li>
            </ul>
        </div>

        <h2>HOW DOES <site-name :uppercase="true" /> PROTECT MY INFORMATION?</h2>
        <div>
            The security of your personal information is a high priority for <site-name />. We assume all responsibility for your
            personal information while it is in our possession, and thus, we maintain appropriate safeguards and current security standards to protect
            your personal information, whether recorded on paper or captured electronically, against unauthorized access, disclosure, or misuse. We
            also take responsibility for your personal information that we may transfer to a third party for processing. This being the case, we
            use contractual or other means to provide a comparable level of protection while the information is being processed by a third party.
        </div>

        <h2>HOW CAN I VERIFY MY INFORMATION?</h2>
        <div>
            You can check your information to verify, update, or correct it, and to have any obsolete information removed. You can also ask to review
            any of the information that we have retained, how we have used it, and to whom we have disclosed it at
            any time by contacting us at {{ helpEmailAddress }}. Subject to certain exceptions prescribed by law, and provided
            we can authenticate your identity, you will be given reasonable access to your personal information, and will be entitled to challenge
            the accuracy and completeness of the information and to have it amended as appropriate.
        </div>

        <div class="mtl">
            You can also ask us to change your preferences regarding how we use or disclose your information, or let us know that you do not
            wish to receive any further communication from us.
        </div>

        <h2>WHEN IS MY INFORMATION REMOVED?</h2>
        <div>
            We keep your information only as long as we need it for the products and services you're using and for a reasonable time thereafter or
            to meet any legal requirements. We have retention standards that meet these requirements. We destroy your information when it is no
            longer needed, or we remove your personally identifiable information.
        </div>

        <div class="mtl">
            You can also request that we remove your information from our records. Subject to our requirements for continued retention of
            your information, for example, for billing, audit, or warranty purposes, we will make every reasonable effort to honour your request.
        </div>

        <h2>HOW CAN I CONTACT <site-name :uppercase="true" />?</h2>
        <div>
            <site-name /> is responsible for all personal information under its control. If you have any questions, concerns or
            complaints about the privacy policies please contact us at {{ helpEmailAddress }}
        </div>

        <div class="mtl">
            We will respond to your request or investigate your concern as quickly as we can.
        </div>

        <h2>WILL THIS TERMS OF USE AND PRIVACY POLICY CHANGE?</h2>
        <div>
            To accommodate changes in our service, the technology, and legal developments, this Policy may change over time. We may add,
            change, or remove portions of this Policy when we feel it is appropriate to do so. Whenever we update this Policy we will change
            the date on the Policy to indicate when the changes were made.
        </div>
    </div>
</template>


<style lang="scss">
    @import "~assets/css/components/_privacy.scss";
</style>
