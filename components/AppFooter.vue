<script>
import {
    FigContent,
    FigIconLabel,
    FigBvLogo
} from '@notoursllc/figleaf';
import Divider from '@notoursllc/figleaf/components/divider/Divider.vue';

export default {
    components: {
    FigContent,
    FigIconLabel,
    FigBvLogo,
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
        <fig-content class="py-10 px-6">
            <div class="grid grid-cols-2 gap-4 md:gap-8">

                <div>
                    <fig-bv-logo />
                </div>

                <div class="sm:grid sm:grid-cols-3 sm:gap-8">
                    <!-- PRODUCTS -->
                    <div>
                        <h3 class="footer-badge">{{ $t('PRODUCTS') }}</h3>
                        <ul role="list" class="mt-4 space-y-2">
                            <li v-for="(obj, type) in productSubTypes" :key="obj.id">
                                <nuxt-link
                                    tag="a"
                                    :to="{ name: 'productSubType', params: { productSubType: obj.slug } }">{{ $t(type) }}</nuxt-link>
                            </li>
                            <li>
                                <nuxt-link
                                    :to="{ name: 'index' }"
                                    tag="a">{{ $t('All') }}</nuxt-link>
                            </li>
                        </ul>
                    </div>

                    <!-- TERMS -->
                    <div class="mt-10 sm:mt-0">
                        <h3 class="footer-badge">{{ $t('TERMS') }}</h3>
                        <ul role="list" class="mt-4 space-y-2">
                            <li>
                                <nuxt-link
                                    tag="a"
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
                </div>
            </div>
        </fig-content>

        <div class="footer-base">
            <fig-content class="sm:grid sm:grid-cols-2 sm:gap-8 text-gray-700">
                <fig-icon-label>
                    <template v-slot:left>
                        <fig-icon
                            icon="shield-check"
                            width="24"
                            height="24" />
                    </template>
                    {{ $t('footer_cart_secure') }}
                </fig-icon-label>

                <div class="mt-4 sm:mt-0 md:text-right">&#169; {{ year }} {{ siteName }}, {{ $t('All Rights Reserved') }}.</div>
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
