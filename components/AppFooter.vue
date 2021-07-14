<script>
import { FigContent } from '@notoursllc/figleaf';

export default {
    components: {
        FigContent
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
    <footer class="footerm">
        <div class="px-3 py-5 mx-auto mt-3 max-w-7xl">
            <fig-content class="flex flex-row justify-between items-start flex-wrap">
                <nav class="nav-item">
                    <dl>
                        <dt>
                            <div class="footer-badge">{{ $t('PRODUCTS') }}</div>
                        </dt>

                        <dd v-for="(obj, type) in productSubTypes" :key="obj.id">
                            <nuxt-link
                                tag="a"
                                :to="{ name: 'productSubType', params: { productSubType: obj.slug } }">{{ $t(type) }}</nuxt-link>
                        </dd>
                        <dd>
                            <nuxt-link
                                :to="{ name: 'index' }"
                                tag="a">{{ $t('All') }}</nuxt-link>
                        </dd>
                    </dl>
                </nav>

                <nav class="nav-item">
                    <dl>
                        <dt>
                            <div class="footer-badge">{{ $t('TERMS') }}</div>
                        </dt>

                        <dd>
                            <nuxt-link
                                tag="a"
                                class="underline"
                                :to="{name: 'returns'}"
                                data-testid="footer-link-returns">{{ $t('Returns / Exchanges') }}</nuxt-link>
                        </dd>
                        <dd>
                            <nuxt-link
                                :to="{name: 'privacy'}"
                                data-testid="footer-link-privacy">{{ $t('Privacy') }}</nuxt-link>
                        </dd>
                        <dd>
                            <nuxt-link
                                :to="{name: 'conditions-of-use'}"
                                data-testid="footer-link-conditions">{{ $t('Conditions of Use') }}</nuxt-link>
                        </dd>
                        <dd>
                            <nuxt-link
                                :to="{name: 'use-of-cookies'}"
                                data-testid="use-of-cookies">{{ $t('Use of Cookies') }}</nuxt-link>
                        </dd>
                    </dl>
                </nav>

                <nav class="nav-item">
                    <dl>
                        <dt>
                            <div class="footer-badge">{{ $t('BREADVAN') }}</div>
                        </dt>
                        <dd>
                            <nuxt-link
                                :to="{name: 'contact-us'}"
                                data-testid="footer-link-contactus">{{ $t('Contact BreadVan') }}</nuxt-link>
                        </dd>
                    </dl>
                </nav>
            </fig-content>
        </div>

        <div class="footer-base">
            <fig-content>
                <div class="flex flex-row items-center justify-between text-gray-700">
                    <div>
                        <span class="pr-1"><fig-icon icon="shield-check" width="24" height="24" /></span>
                        <span>{{ $t('footer_cart_secure') }}</span>
                    </div>

                    <div>&#169; {{ year }} {{ siteName }}, {{ $t('All Rights Reserved') }}.</div>
                </div>
            </fig-content>
        </div>
    </footer>
</template>


<style lang="postcss" scoped>
footer {
    @apply mt-24 text-sm;
    background: #cceaf1;
}
footer a {
    @apply text-gray-700;
    text-decoration: none !important;
}
footer a:hover { text-decoration: underline !important; }

footer .nav-item {
    @apply items-center justify-center flex-grow max-w-xs px-4;
}

footer dt {
    @apply mb-4 font-semibold;
}

footer dd {
    @apply leading-4;
}

@screen lg {
    footer dd {
        @apply leading-6;
    }
}

.footer-badge {
    @apply text-white inline-block py-1 px-2 rounded;
    background-color: #ff7101;
}

.footer-base {
    @apply p-6;
    background: #b8e1eb;
}
</style>
