<script>
export default {
    components: {
        IconLogo: () => import('@/components/icons/IconLogo')
    },

    data: function() {
        return {
            year: new Date().getFullYear(),
            siteName: this.$store.state.ui.siteName
        }
    }
}
</script>

<template>
    <footer class="footer">
        <div class="content">
            <div class="nav-container">
                <nav class="nav-item" id="footer-logo">
                    <icon-logo icon-name="breadvan_vintage_racing_apparel" class-name="fillWhite" width="125px" />
                </nav>

                <nav class="nav-item">
                    <dl>
                        <!-- <dt>Product</dt> -->
                        <dd>
                            <nuxt-link tag="a"
                                class="underline"
                                :to="{name: 'returns'}"
                                data-testid="footer-link-returns">{{ $t('Returns / Exchanges') }}</nuxt-link>
                        </dd>
                    </dl>
                </nav>

                <nav class="nav-item">
                    <dl>
                        <!-- <dt>Company</dt> -->
                        <dd>
                            <nuxt-link
                                :to="{name: 'contact-us'}"
                                data-testid="footer-link-contactus">{{ $t('Contact Us!') }}</nuxt-link>
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
                    </dl>
                </nav>
            </div>
        </div>

        <div class="sub-footer tar">
            &#169; {{ year }} {{ siteName }}, {{ $t('All Rights Reserved') }}.
        </div>
    </footer>
</template>


<style lang="scss" scoped>
@import "~assets/css/components/_variables.scss";
@import "~assets/css/components/_mixins.scss";

footer {
    background-color: #267fad;
    color: #fff;
    font-size: 14px;

    .content {
        color: #fff;
        padding: 10px 20px;
        max-width: 1230px;
        margin: 15px auto 0 auto;
    }

    a {
        color: #fff;
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
        }
    }

    dt {
        margin-bottom: 5px;
        font-weight: bold;
    }

    dd {
        line-height: 25px;
    }

    .sub-footer {
        background-color: rgba(0, 0, 0, 0.1);
        color: #fff;
        margin-top: 10px;
        padding: 10px 40px;
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
