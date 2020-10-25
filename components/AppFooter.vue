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
    <footer class="footer">
        <div class="content">
            <div class="nav-container">

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


<style lang="scss" scoped>
@import "~assets/css/components/_variables.scss";
@import "~assets/css/components/_mixins.scss";

footer {
    border-top: 1px solid #e1e2e2;
    background-color: #fff;
    font-size: 14px;
    margin-top: 100px;

    .content {
        padding: 10px 20px;
        max-width: 1230px;
        margin: 15px auto 0 auto;
    }

    a {
        text-decoration: none !important;
    }
    a:hover {
        text-decoration: underline !important;
    }

    .nav-container {
        @include flexbox();
        @include flex-direction(row);
        @include justify-content(space-between);
        @include align-items(flex-start);
        @include flex-wrap(wrap);

        .nav-item {
            @include align-items(center);
            @include justify-content(center);
            @include flex-basis(auto);
            @include flex-grow(1);
            max-width: 200px;
            padding: 0 10px;
        }
    }

    dt {
        margin-bottom: 15px;
        font-weight: bold;
    }

    dd {
        line-height: 25px;
    }
}

@media #{$medium-and-down} {
    footer {
        margin-bottom: 0;

        #footer-logo {
            display: none;
        }

        dd {
            line-height: 30px;
        }
    }
}
</style>
