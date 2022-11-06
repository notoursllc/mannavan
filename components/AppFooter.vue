<script>
import {
    FigContent,
    FigIconLabel,
    FigBvLogo,
    FigIcon
} from '@notoursllc/figleaf';
import Divider from '@notoursllc/figleaf/components/divider/Divider.vue';

export default {
    components: {
        FigContent,
        FigIconLabel,
        FigBvLogo,
        FigIcon,
        Divider
    },

    data: function() {
        return {
            year: new Date().getFullYear(),
            siteName: this.$store.state.ui.siteName
        };
    },

    computed: {
        productSubTypes() {
            return this.$store.state.product.subTypes;
        }
    }
};
</script>

<template>
    <footer class="footer">
        <fig-content class="p-10 grid gap-3 md:gap-8 sm:grid-cols-2 md:grid-cols-3" nopad>
            <!-- PRODUCTS -->
            <div>
                <h3 class="footer-badge">{{ $t('PRODUCTS') }}</h3>
                <ul role="list" class="mt-4 space-y-2">
                    <li v-for="(obj, type) in productSubTypes" :key="obj.id">
                        <nuxt-link
                            :to="{ name: 'productSubType', params: { productSubType: obj.slug } }">{{ $t(type) }}</nuxt-link>
                    </li>
                    <li>
                        <nuxt-link
                            :to="{ name: 'index' }">{{ $t('All') }}</nuxt-link>
                    </li>
                </ul>
            </div>

            <!-- TERMS -->
            <div class="mt-10 sm:mt-0">
                <h3 class="footer-badge">{{ $t('TERMS') }}</h3>
                <ul role="list" class="mt-4 space-y-2">
                    <li>
                        <nuxt-link
                            class="underline"
                            :to="{name: 'returns'}"
                            data-testid="footer-link-returns">{{ $t('Returns / Exchanges') }}</nuxt-link>
                    </li>
                    <li>
                        <nuxt-link
                            :to="{name: 'privacy'}"
                            data-testid="footer-link-privacy">{{ $t('Privacy') }}</nuxt-link>
                    </li>
                    <li>
                        <nuxt-link
                            :to="{name: 'conditions-of-use'}"
                            data-testid="footer-link-conditions">{{ $t('Conditions of Use') }}</nuxt-link>
                    </li>
                    <li>
                        <nuxt-link
                            :to="{name: 'use-of-cookies'}"
                            data-testid="use-of-cookies">{{ $t('Use of Cookies') }}</nuxt-link>
                    </li>
                </ul>
            </div>

            <!-- BREADVAN -->
            <div class="mt-10 sm:mt-0">
                <h3 class="footer-badge">{{ $t('BREADVAN') }}</h3>
                <ul role="list" class="mt-4 space-y-2">
                    <li>
                        <nuxt-link
                            :to="{name: 'contact-us'}"
                            data-testid="footer-link-contactus">{{ $t('Contact BreadVan') }}</nuxt-link>
                    </li>
                </ul>
            </div>
        </fig-content>

        <div class="footer-base">
            <fig-content class="grid md:grid-cols-2 gap-8 text-gray-700">
                <div class="sm:mx-auto">
                    <fig-icon-label>
                        <template v-slot:left>
                            <fig-icon
                                icon="shield-check"
                                width="30"
                                height="30" />
                        </template>
                        <div class="pl-2">
                            <div>{{ $t('We never store your card details.')}}</div>
                            <div>{{ $t('Our cart is protected by 256-bit encrypted connection.') }}</div>
                        </div>
                    </fig-icon-label>
                </div>

                <div class="text-center md:text-right">
                    &#169; {{ year }} {{ siteName }}, {{ $t('All Rights Reserved') }}.
                </div>
            </fig-content>

            <fig-content class="text-center pt-4 md:pt-0">
                <fig-bv-logo
                    class="inline-block"
                    width="80"
                    height="80" />
            </fig-content>
        </div>
    </footer>
</template>


<style scoped>
footer {
    @apply mt-24 text-sm;
    background: #cceaf1;
}
footer a {
    @apply text-gray-700;
    text-decoration: none !important;
}
footer a:hover {
    text-decoration: underline !important;
}

.footer-badge {
    @apply text-white font-bold inline-block py-1 px-2 rounded;
    background-color: #ea700f;
}

.footer-base {
    @apply p-6;
    background: #b8e1eb;
}
</style>
