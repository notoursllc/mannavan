<script>
import Vue from 'vue'
import { mapState, mapGetters } from 'vuex'
import { Button } from 'element-ui'
import product_mixin from '@/mixins/product_mixin'
import app_mixin from '@/mixins/app_mixin'
import IconVictory from '@/components/icons/IconVictory'
import IconCart from '@/components/icons/IconCart'
import IconCap from '@/components/icons/IconCap'
import IconTshirt from '@/components/icons/IconTshirt'
import IconLogo from '@/components/icons/IconLogo'

Vue.use(Button);

export default {
    components: {
        IconVictory,
        IconCart,
        IconCap,
        IconTshirt,
        IconLogo
    },

    mixins: [
        product_mixin
    ],

    data: function() {
        return {
            year: new Date().getFullYear(),
            siteName: app_mixin.methods.getSiteName()
        }
    },

    computed: {
        ...mapGetters({
            numCartItems: 'shoppingcart/numItems',
        })
    }
}
</script>


<template>
    <div class="layoutContainer">

        <aside class="navbar-container">
            <div class="navbar-header">
                <nuxt-link
                    :to="{ name: 'index' }"
                    tag="span"
                    class="cursorPointer">
                    <icon-victory icon-name="logo" class-name="fillBurntOrange" width="85px" height="42px" />
                </nuxt-link>
            </div>

            <nuxt-link
                v-for="(obj, key) in getProductSubTypeData()"
                :key="key"
                :to="{ name: 'type-name', params: { name: obj.label } }"
                tag="a"
                class="navbar-item"
                active-class="active">
                <icon-cap icon-name="cap" class-name="fillWhite" width="35px" height="35px" v-if="obj.label === 'hats'" />
                <icon-tshirt icon-name="tops" class-name="fillWhite" width="35px" height="35px" v-if="obj.label === 'tops'" />
                <div class="navbar-item-label">{{ $tc(key, 2) }}</div>
            </nuxt-link>

            <nuxt-link
                :to="{ name: 'cart-id' }"
                tag="a"
                class="navbar-item"
                :class="{'bounce': numCartItems}"
                active-class="active">
                <div class="inlineBlock relative">
                    <icon-cart icon-name="shopping_cart" :class-name="numCartItems ? 'fillLime': 'fillWhite'" width="35px" height="35px" />
                    <span class="badge" v-if="numCartItems">{{ numCartItems }}</span>
                </div>
                <div class="navbar-item-label">{{ $t('Checkout') }}</div>
            </nuxt-link>
        </aside>

        <header role="banner" v-if="$store.state.ui.pageTitle">
            <div class="header-grow-container">
                <div class="inlineBlock header-page-title">{{ $store.state.ui.pageTitle }}</div>
            </div>
        </header>

        <main>
            <nuxt/>
        </main>

        <footer class="footer">
            <div class="content">
                <div class="nav-container">
                    <nav class="nav-item">
                        <dl>
                            <dt>Product</dt>
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
                            <dt>Company</dt>
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

                    <nav class="nav-item" id="footer-logo">
                        <icon-logo icon-name="breadvan" class-name="fillWhite" width="150px" />
                    </nav>
                </div>
            </div>

            <div class="sub-footer tar">
                &#169; {{ year }} {{ siteName }}, {{ $t('All Rights Reserved') }}.
            </div>
        </footer>
    </div>
</template>


<style lang="scss" scoped>
@import "~assets/css/components/_variables.scss";
@import "~assets/css/components/_mixins.scss";

$aside-width: 110px;
$bottom-bar-height: 56px;
$header-height: 40px;
$header-secondary-logo-width: 150px;

#__nuxt,
#__layout,
.layoutContainer {
    @include flexbox();
    @include flex-direction(column);
    // use height instead of min-height because of an IE10-11 flex bug:
    // https://github.com/philipwalton/flexbugs#flexbug-3
    height: 100vh;
}

.cart-active {
    color: #7eef47 !important;
}

.layoutContainer {
    main {
        @include flex-grow(1);
        @include flex-basis(auto);
    }

    header {
        @include flexbox();
        @include flex-direction(row);
        @include flex-wrap(nowrap);
        // @include align-items(center);
        @include justify-content(center);
        // background-color: #313131;
        background-color: #fff;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        color: $colorOrange;
        height: $header-height;
        min-height: $header-height;
        padding: 0 20px;

        .header-secondary-logo {
            @include align-items(center);
            display: none;
            padding: 0;
            white-space: nowrap;
            width: $header-secondary-logo-width;
        }

        .header-grow-container {
            @include flexbox();
            @include flex(1 0 auto);
            @include align-items(center);
            @include justify-content(center);
            // border: 1px solid red;
        }

        .header-page-title {
            font-size: 20px;
            line-height: 20px;
        }
    }

    footer {
        background-color: #3d3d3d;
        color: #fff;
        font-size: 14px;
        margin-bottom: $bottom-bar-height;

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
            @include flex-direction(row);
            @include justify-content(space-between);
            @include align-items(flex-start);
            @include flex-wrap(wrap);

            .nav-item {
                @include align-items(center);
                @include justify-content(center);
                @include flex-basis(auto);
                @include flex-grow(1);
                margin-bottom: 20px;
            }
        }

        #footer-logo {
            display: none;
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
}

.navbar-container {
    @include box-shadow(0, 0, 4px, rgba(0, 0, 0, .5));
    @include flexbox();
    @include justify-content(center);
    position: fixed;
    bottom: 0;
    width: 100%;
    z-index: 2;
    height: $bottom-bar-height;
    // background: rgba(204,5,5,0.8);
    background: #d5393f;
    background: linear-gradient(60deg, #c30810 0%, #e66d17 100%) no-repeat scroll center center/cover;
    // background: linear-gradient(60deg, #e0282f 0%, #e67417 100%) no-repeat scroll center center/cover;
    // background: linear-gradient(60deg, #e67417 0%, #e0282f 100%) no-repeat scroll center center/cover;


    .navbar-header {
        display: none;
        color: #fff;
        height: $header-height;
        // padding: 10px;
        text-align: center;
        // background-color: rgba(255, 255, 255, 0.1);
        margin: 20px 0 50px 0;
    }

    .logo {
        font-size: 85px;
        color: #9e0403;
    }

    .navbar-item {
        @include flex-grow(1);
        @include justify-content(center);
        @include align-items(center);
        min-width: 70px;
        height: 100%;
        padding: 5px 12px 10px;
        cursor: pointer;
        // transform: translateZ(0);
        text-decoration: none;
        text-align: center;
        color: #fff;
        @include transition('background-color', 0.25s);
        position: relative;

        &:hover,
        &.navbar-item-checkout:hover {
            background-color: rgba(255,255,255,0.1);
            @include transition('background-color', 0.25s);
        }

        &.active {
            background-color: rgba(255,255,255,.2);
            @include transition('background-color', 0.25s);
        }

        .badge {
            background-color: #3ca707;
            border-radius: 10px;
            box-shadow: 0 0 1px 1px rgba(255, 255, 12550, 0.5);
            color: #fff;
            display: inline-block;
            font-size: 14px;
            height: 18px;
            line-height: 18px;
            padding: 0 6px 0 5px;
            text-align: center;
            white-space: nowrap;
            position: absolute;
            top: -2px;
            right: -14px;
        }

        .navbar-item-label {
            display: block;
            font-size: 12px;
            margin-top: -10px;
        }

        &.navbar-item-checkout {
            background-color: rgba(68, 152, 90, 0.8)
        }
    }
}

@media #{$medium-and-up} {
    .layoutContainer {
        header,
        main,
        footer {
            margin-left: $aside-width
        }

        footer {
            margin-bottom: 0;

            .nav-container {
                @include flexbox()
            }

            .nav-item {
                @include flexbox()
            }

            #footer-logo {
                display: flex !important;
            }

            dt {
                margin-bottom: 15px;
            }

            dd {
                line-height: 30px;
            }
        }

        header {
            .header-secondary-logo {
                @include flexbox();
            }

            .header-page-title {
                font-size: 26px;
            }
         }
    }

    .navbar-container {
        @include flex-direction(column);
        @include justify-content(flex-start);
        position: fixed;
        top: 0;
        // box-shadow: none;
        width: $aside-width;
        // padding-top: 64px;
        height: 100%;

        .navbar-header {
            display: block;
        }

        .navbar-item {
            @include flexbox();
            @include flex(1 0 auto);
            @include flex-flow(column nowrap);
            @include align-items(center);
            color: #fff;
            max-height: 72px;
            margin-bottom: 10px;
            height: 100%;
            padding: 8px 12px 10px;
            // justify-content: space-between;
            cursor: pointer;
            transform: translateZ(0);
            font-size: 14px;
            line-height: 1em;
            text-decoration: none;
            position: relative;

            i {
                @include align-items(center);
                font-size: 24px;
                margin: auto;
            }

            .navbar-item-label {
                font-size: 14px;
                margin-top: 2px;
            }
        }
    }
}
</style>
