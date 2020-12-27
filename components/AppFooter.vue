<script>
export default {
    components: {
        IconLogo: () => import('@/components/icons/IconLogo'),
        IconVictory: () => import('@/components/icons/IconVictory')
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
    <footer class="footer border-t border-gray-400 bg-white text-sm mt-24">
        <div class="px-3 py-5 mx-auto mt-3 max-w-7xl">
            <div class="container mx-auto flex flex-row justify-between items-start flex-wrap">

                <nav class="nav-item">
                    <dl>
                        <dt>
                            <fig-icon icon="building-store" width="24" height="24" />
                            {{ $t('PRODUCTS') }}</dt>

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
                            <fig-icon icon="checkbox" width="24" height="24" />
                            {{ $t('TERMS') }}
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
                            <fig-icon icon="shield-check" width="24" height="24" />
                            {{ $t('SECURE') }}
                        </dt>

                        <dd>{{ $t('footer_cart_secure') }}</dd>
                    </dl>
                </nav>

                <nav class="nav-item">
                    <dl>
                        <dt>
                            <icon-victory icon-name="logo" class="vam" width="30" height="30" />
                            {{ $t('BREADVAN') }}
                        </dt>
                        <dd>
                            <nuxt-link
                                :to="{name: 'contact-us'}"
                                data-testid="footer-link-contactus">{{ $t('Contact BreadVan') }}</nuxt-link>
                        </dd>
                    </dl>
                </nav>
            </div>

            <div class="tac">
                <icon-logo icon-name="breadvan_vintage_racing_apparel" width="100px" />

                <div class="ptm fs12">
                    &#169; {{ year }} {{ siteName }}, {{ $t('All Rights Reserved') }}.
                </div>
            </div>
        </div>
    </footer>
</template>


<style lang="postcss" scoped>
footer a { text-decoration: none !important; }
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
</style>
