<script>
export default {
    name: 'ConditionsOfUseDisplay',

    components: {
        BrandName: () => import('@/components/BrandName')
    },

    data: function() {
        return {
            siteUrl: this.$store.state.ui.siteUrlShort,
            infoEmailAddress: this.$store.state.ui.infoEmailAddress
        }
    }
}
</script>


<template>
    <div class="priv">
        Welcome to the <brand-name /> website, operated by Not Ours, LLC. (<brand-name />) and located at
        {{ siteUrl }} (the "Site"). The following terms and conditions (“Terms”) govern your use of the Site.

        <div class="mtl">
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

        <div class="mtl">
            When placing an order through the Site, you will be required to provide other personal information, such as
            shipping address, billing address, and payment details. Additional information may be collected by <brand-name />
            or its third party providers at this time for security and anti-fraud purposes. You represent that the personal
            information you provide to us via the Site is true, valid, complete and up-to-date in all respects, and you confirm
            that you are the person referred to in the shipping (unless the item is a gift) and billing information provided. Should
            any of the information you provide on the Site change, please login to your account and update such information directly
            on the Site.
        </div>

        <div class="mtl">
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

        <div class="mtl">
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

        <h2>4. Content</h2>
        As between you and <brand-name />, <brand-name /> owns or licenses all information and materials, including logos, designs, titles,
        phrases, product names, images, illustrations, icons, photographs, and the copyrights, trademarks, service marks, trade dress, and other
        intellectual property rights associated therewith, in or made available through the Site (“Site Content”), as well as the selection,
        coordination, arrangement, and organization and enhancement of the Site Content. All Site Content is protected pursuant to copyright,
        trademark, patent, and other applicable laws. You agree not to remove or alter any copyright notice or any other proprietary notice on
        any Site Content. As between you and <brand-name />, all names, trademarks, symbols, slogans, or logos appearing on the Site are proprietary
        to <brand-name /> or its affiliates, licensors, or suppliers. Use or misuse of these trademarks is expressly prohibited and may violate
        federal and state trademark law. Under no circumstances will you have any rights of any kind in or to the Site Content, other than the
        right to use the Site Content in accordance with these Terms.

        <div class="mtl">
            Certain features of the Site may allow you to contribute feedback and other information to the Site for access, use,
            viewing, and commentary by other users of the Site (collectively, “Comments”). By posting Comments, you represent
            that you have the full legal right to provide the Comments and that use of the Comments by <brand-name /> on the
            Site, and all other persons and entities, will not: (a) infringe any intellectual property rights of any person or
            entity or any rights of publicity, personality, or privacy of any person or entity, including as a result of your
            failure to obtain consent to post personally identifying or otherwise private information about a person; (b) violate
            any law, statute, ordinance, regulation, or agreement; or (c) constitute disclosure of any confidential information
            owned by any third party. Upon your submission of Comments or other material or information to <brand-name />,
            you grant <brand-name /> a worldwide, perpetual, irrevocable, transferable, license to access, use, distribute,
            reproduce, display, modify, create derivative works based upon, and sublicense the Comments, all without any
            compensation to you whatsoever. For avoidance of doubt, <brand-name /> shall be under no obligation: (1) to maintain
            any Comments in confidence; (2) to compensate you in any way for your Comments; or (3) to respond to any Comments.
        </div>

        <h2>5. Errors, Inaccuracies, and Omissions</h2>
        Occasionally there may be information on the Site that contains typographical errors, inaccuracies, or omissions that may
        relate to product descriptions, pricing, promotions, offers, and availability. We reserve the right to correct any errors,
        inaccuracies or omissions and to change or update information or cancel orders if any information on the Site is inaccurate
        at any time without prior notice (including after you have submitted your order). We cannot and do not review all communications,
        products, or services made available on or through the Site, but, although not obligated to, may review, verify, make changes
        to or remove any Comments, Site Content, or the Site, including information submitted in connection with the Site Content or
        other features at any time, with or without notice in our sole discretion.

        <h2>6. Disclaimers and Warranties</h2>
        <brand-name /> reserves the right to change the assortment of items offered and to limit the quantity of items that may be
        purchased from time to time and at any time, without prior notice. We also reserve the right to alter the terms or duration
        of any special offers or sale promotion. <brand-name /> is not liable in case of stock outage or unavailability of products.
        We have made every effort to display as accurately as possible the colors of our products that appear at the Site, but we
        cannot guarantee that your computer monitor's display of any color will be accurate.

        <div class="mtl">
            <brand-name /> expressly disclaims, to the fullest extent permitted by law, any express or implied warranties: (i) that the
            Site, Services, Site Content, goods, advice, information or links provided on the Site will meet your requirements; (ii) that
            the Services will be uninterrupted, timely, secure or free from error; (iii) that defects in the operation or functionality
            of any software provided to you as part of the Services will be corrected; (iv) regarding the Site Content, goods, services,
            advice, information or links provided by any third parties or users; (v) that the Site, Site Content, goods, services, advice,
            or information displayed on the Site will meet your requirements; and (vi) that the Site will be error-free or that any errors
            will be corrected. No advice or information, whether oral or written, obtained by you from the Site shall create any warranty
            not expressly stated in these Terms.
        </div>

        <div class="mtl">
            You understand that the technical processing and transmission of any Site Content and Comments may be transferred
            unencrypted and involve transmissions over various networks and changes to conform and adapt to technical requirements
            of connecting networks or devices. Please be advised that we do not guarantee that any information sent to or from our
            Site will be secure during transmission, nor can we guarantee the confidentiality of any communication or material
            transmitted to us via the Site or the Internet, including, for example, personal information such as your name or
            address. <brand-name /> assumes no responsibility for: (a) any error, omission, interruption, deletion, defect, delay
            in operation or transmission, communications line failure, theft or destruction or unauthorized access to, or alteration
            of, any communication; and (b) any problems or technical malfunction of any telephone network or lines, computer online
            systems, servers or providers, computer equipment, software, failure of any email or players due to technical problems
            or traffic congestion on the Internet or on any of the Site, including any injury or damage to you or to any person’s
            computer related to or resulting from use of the Services or the Site.
        </div>

        <div class="mtl">
            No conditions, warranties or other terms (including any implied terms as to satisfactory quality, fitness for purpose
            or conformance with description) apply to the Site, Site Content and/or Services except to the extent that they are
            expressly set out in these Terms.
        </div>

        <h2>7. Limitation of Liability</h2>
        IN NO EVENT WILL <brand-name :uppercase="true" /> BE LIABLE FOR DAMAGES OTHER THAN ACTUAL AND DIRECT DAMAGES PROVEN IN A COURT
        OF LAW. IN NO EVENT SHALL <brand-name :uppercase="true" />’S LIABILITY EXCEED THE PRICE YOU PAID FOR THE PRODUCT OR SERVICE THAT IS THE SUBJECT
        OF THE CLAIM. IF ANY PART OF THIS LIMITATION OF LIABILITY IS FOUND TO BE INVALID OR UNENFORCEABLE FOR ANY REASON, THEN THE TOTAL
        LIABILITY OF <brand-name :uppercase="true" /> AND ITS LICENSORS SHALL NOT EXCEED TEN DOLLARS ($10).

        <div class="mtl">
            Without limiting the foregoing, you understand and acknowledge that <brand-name /> shall not be liable to you for:
            <ul>
                <li>Any indirect, incidental, consequential, punitive or exemplary losses which may be incurred by you arising out
                    of your use of, or inability to use, the Site or the Services, including any loss of profit (whether incurred directly
                    or indirectly), any loss of goodwill or business reputation, or any loss of data suffered by you; or</li>
                <li>Any loss or damage which may be incurred by you as a result of: (i) any reliance placed by you on the completeness,
                    accuracy or existence of any advertising, or as a result of any relationship or transaction between you and any
                    advertiser or sponsor whose advertising appears on the Site or the Services; (ii) any changes that <brand-name />
                    may make to the Site or Services, or for any permanent or temporary cessation in the provision of the Services
                    (or any features within the Services); (iii) the deletion of, corruption of, unauthorized access to, or failure
                    to store, any content and other communications data maintained or transmitted by or through your use of the Site
                    or the Services; (iv) the use of any products or services obtained on or through the Site; or (v) any other matter
                    relating to the Site, the Services, the Site Content, or the Comments.</li>
            </ul>
        </div>

        <div class="mtl">
            The limitations on <brand-name />’s liability to you in this Section 7 shall apply whether or not <brand-name /> has
            been advised of or should have been aware of the possibility of any such losses arising.
        </div>

        <div class="mtl">
            IF YOU ARE DISSATISFIED WITH THE SITE, THE SERVICES, OR THE TERMS OF USE, YOUR SOLE AND EXCLUSIVE REMEDY IS TO
            DISCONTINUE USING THE SITE AND SERVICES.
        </div>

        <h2>8. Indemnity</h2>
        You agree to defend, indemnify and hold harmless <brand-name />, its officers, directors, members, employees, agents,
        affiliates, licensors and suppliers, from and against any and all claims, damages, obligations, losses, liabilities, costs
        or debt, and expenses (including but not limited to attorney’s fees) arising from: (i) your use of and access to the Site
        and Services; (ii) your violation of any of these Terms, including the Privacy Policy; (iii) your violation of any third
        party rights, including without limitation any copyright, intellectual property, or privacy rights; or (vi) the use by any
        other persons accessing this Site using your Internet account or account login. This defense and indemnification obligation
        will survive these Terms and your use of the Site and Services. We reserve the right, at our own expense, to assume the
        exclusive defense and control of any matter otherwise subject to indemnification by you hereunder, and you shall cooperate
        in all reasonable respects in such defense. You may not settle any claim contemplated in this Section 8 without the prior
        written consent of <brand-name />.

        <h2>9. Links To Other Sites</h2>
        The Site may contain links or references to other websites outside of our control. Links to other websites may use our Site
        logo or style as a result of a co-branding agreement. These websites may send cookies to you and may collect personally
        identifiable information about you and make use of that data in ways that this Site would not. Please be aware
        that <brand-name /> has no control over these websites and that these Terms of Use do not apply to any third party
        sites. <brand-name /> cannot be held responsible for those sites or external sources, or for any damage or losses deriving
        from the use of the content, or goods and services available on those sites or external sources. <brand-name /> encourages
        you to read the privacy policies and terms of use linked or referenced in the websites you enter.

        <h2>10. Complaint Procedures</h2>
        If you believe that any content or postings on this Site violates your intellectual property or other rights, please
        notify <brand-name /> by email at {{ infoEmailAddress }} with a comprehensive detailed message setting forth the following
        information: (a) your name and the name of your company, if any; (b) your contact information, including your email address;
        (c) the nature and substance of your complaint, the specific rights at issue, and your basis for making the complaint, including
        the content or posting that is objectionable; and (d) the following statement: “The statements, representations, and assertions
        made in this message are true, complete, and accurate and I have the full legal authority to make each and every such statement,
        representation, and assertion and to make and be granted any demand made in this message.”

        <h2>11. Dispute Resolution</h2>
        Any dispute arising out of these Terms shall be resolved exclusively through final and binding arbitration conducted by the
        American Arbitration Association (the “AAA”). Arbitration uses a neutral arbitrator instead of a judge or jury, and court
        review of an arbitration award is very limited. However, an arbitrator can award the same damages and relief on an
        individual basis that a court can award to an individual; and an arbitrator must also follow the terms of these Terms, as
        a court would. All issues are for the arbitrator to decide, except that issues relating to arbitrability and the scope or
        enforceability of this agreement to arbitrate shall be for a court of competent jurisdiction to decide. Arbitration shall
        take place in San Francisco, California, unless <brand-name /> elects otherwise.

        <div class="mtl">
            The arbitrator will decide the substance of all claims in accordance with the laws of the State of California. The
            arbitrator shall not be bound by rulings in prior arbitrations involving different <brand-name /> users, but is bound
            by rulings in prior arbitrations involving the same <brand-name /> user to the extent required by applicable law. The
            arbitrator's award shall be final and binding, and judgment on the award rendered by the arbitrator may be entered in
            any court having jurisdiction thereof. Payment of all filing, administration, and arbitrator fees will be governed by
            the AAA's rules, unless otherwise stated in this Agreement to Arbitrate. If the value of the relief sought is $10,000 or
            less, at your request, <brand-name /> will pay all filing, administration, and arbitrator fees associated with the
            arbitration. Any request for payment of fees by <brand-name /> should be submitted by mail to the AAA along with your
            demand for arbitration and <brand-name /> will make arrangements to pay all necessary fees directly to the AAA. If the
            value of the relief sought is more than $10,000 and you are able to demonstrate that the costs of accessing arbitration
            will be prohibitive as compared to the costs of accessing a court for purposes of pursuing litigation on an individual
            basis, <brand-name /> will pay as much of the filing, administration, and arbitrator fees as the arbitrator deems
            necessary to prevent the costs of accessing arbitration from being prohibitive. In the event the arbitrator determines
            the claim(s) you assert in the arbitration to be frivolous, you agree to reimburse <brand-name /> for all fees associated
            with the arbitration paid by <brand-name /> on your behalf that you otherwise would be obligated to pay under the AAA's
            rules. If an arbitrator or court decides that any part of this agreement to arbitrate is invalid or unenforceable,
            the other parts of this agreement to arbitrate shall still apply.
        </div>

        <div class="mtl">
            You can choose to reject this agreement to arbitrate by mailing us a written opt-out notice (“Opt-Out Notice”). The Opt-Out
            Notice must be postmarked no later than thirty days after the date you accept these Terms for the first time. You must complete
            the Opt-Out Notice form by providing the information called for in the form, including your name, address (including street
            number and address, city, state, and zip code), phone number, and the email address used to log in to the <brand-name />
            account to which the opt-out applies. You must sign the Opt-Out Notice for it to be effective. This procedure is the only
            way you can opt out of the agreement to arbitrate. If you opt out of the agreement to arbitrate, all other parts of these
            Terms will continue to apply. Opting out of this agreement to arbitrate has no effect on any previous, other, or future
            arbitration agreements that you may have with us.
        </div>

        <h2>12. Miscellaneous</h2>
        These Terms, including the Privacy Policy, constitute the whole legal agreement between you and <brand-name /> and govern your
        use of the Site, Services and any transactions you may have with <brand-name /> through the Site and completely replaces and
        supersedes any prior agreements or understanding, arrangements, undertaking or proposal, written or oral, between you
        and <brand-name /> in relation to such matters. In the event any other rule, code of conduct, or other matter posted on the
        Site conflicts with the terms of these Terms, these Terms of Use shall govern. No oral explanation or oral information given
        by any party shall alter the interpretation of these Terms. Notwithstanding the foregoing, you understand that <brand-name />
        may make changes to these Terms from time to time. Your continued use of the Site following the posting of changes to these
        Terms of Use will be considered your consent to those changes. When these changes are made, <brand-name /> will make a new
        copy of the Terms of Use available on the Site. You agree that <brand-name /> is under no obligation to provide you with
        notices regarding changes to the Terms of Use. You understand that it is your responsibility to check the Terms regularly
        for changes.

        <div class="mtl">
            You agree that if <brand-name /> does not exercise or enforce any legal right or remedy which is contained in these Terms
            of Use (or which <brand-name /> has the benefit of under any applicable law), this will not be taken to be a formal waiver
            of <brand-name />’s rights and that those rights or remedies will still be available to <brand-name />. If any court of
            law, having the jurisdiction to decide a matter arising out of these Terms, rules that any provision of these Terms is
            invalid, then that provision will be removed from these Terms without affecting the rest of the Terms and the remaining
            provisions will continue to be valid and enforceable.
        </div>

        <div class="mtl">
            The Site is controlled and operated from within the United States. Without limiting anything else, <brand-name /> makes
            no representation that the Site, Site Content, Comments, services, products, information or other materials available on,
            in, or through the Site is appropriate or available for use in other locations, and access to them from territories where
            they are illegal is prohibited. Those who choose to access the Site from other locations do so on their own volition and
            are responsible for compliance with applicable laws.
        </div>
    </div>
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
