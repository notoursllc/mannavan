<script>
import { mapGetters } from 'vuex';
import { headroom } from 'vue-headroom';
import product_mixin from '@/mixins/product_mixin';

export default {
    components: {
        IconVictory: () => import('@/components/icons/IconVictory'),
        IconLock: () => import('@/components/icons/IconLock'),
        AppHeaderCheckoutPopover: () => import('@/components/AppHeaderCheckoutPopover'),
        headroom
    },

    mixins: [
        product_mixin
    ],

    data: function() {
        return {
            productAddedToCart: {
                showPopover: false,
                product: null
            }
        };
    },

    computed: {
        ...mapGetters({
            numCartItems: 'shoppingcart/numItems',
            inCheckoutFlow: 'ui/inCheckoutFlow'
        }),

        productSubTypes() {
            return this.$store.state.product.subTypes;
        }
    },

    created() {
        const onProductAddedToCart = (product) => {
            this.productAddedToCart.product = product;
            this.productAddedToCart.showPopover = true;
        };

        this.$nuxt.$on('PRODUCT_ADDED_TO_CART', onProductAddedToCart)

        this.$once('hook:beforeDestroy', () => {
            this.$nuxt.$off('PRODUCT_ADDED_TO_CART', onProductAddedToCart);
        });
    }
};
</script>

<template>
    <headroom :disabled="inCheckoutFlow" :zIndex="10">

        <header role="banner">
            <div class="bv-header-inner content-wrap">

                <!-- common header -->
                <template v-if="!inCheckoutFlow">
                    <ul class="bv-header-nav-list">
                        <li class="bv-header-nav-item bv-header-breadvan">
                            <icon-victory icon-name="logo" class="vam" />
                        </li>

                        <!-- <li v-for="(obj, type) in productSubTypes"
                            :key="obj.id"
                            class="bv-header-nav-item cursorPointer">
                            <nuxt-link
                                :to="{ name: 'productSubType', params: { productSubType: obj.slug } }"
                                tag="li"
                                active-class="active">{{ $t(type) }}</nuxt-link>
                        </li> -->
                        <nuxt-link
                            v-for="(obj, type) in productSubTypes"
                            :key="obj.id"
                            :to="{ name: 'productSubType', params: { productSubType: obj.slug } }"
                            tag="li"
                            class="bv-header-nav-item cursorPointer fw600"
                            active-class="active">
                            {{ $t(type) }}
                            <div class="active-icon">
                                <svg-icon icon="chevron-up" width="14" height="14" stroke="#b9b8b8" />
                            </div>
                        </nuxt-link>

                        <nuxt-link
                            :to="{ name: 'index' }"
                            tag="li"
                            class="bv-header-nav-item cursorPointer fw600"
                            active-class="active"
                            :exact="true">
                            {{ $t('All') }}
                            <div class="active-icon">
                                <svg-icon icon="chevron-up" width="14" height="14" stroke="#b9b8b8" />
                            </div>
                        </nuxt-link>

                        <!-- <li class="bv-header-nav-item">item</li> -->

                        <nuxt-link
                            :to="{ name: 'cart-id' }"
                            tag="li"
                            class="bv-header-nav-item"
                            :class="{'bounce': numCartItems}">

                            <el-popover
                                v-model="productAddedToCart.showPopover"
                                placement="bottom"
                                width="250"
                                trigger="manual">
                                <span slot="reference" class="cart-button">
                                    <svg-icon icon="cart" width="30" height="30" stroke-width="1px" />
                                    <span class="badge" :class="{'badge-green': numCartItems}">{{ numCartItems }}</span>
                                </span>

                                <div class="tac fw500 fs16 mbm">{{ $t('Added To Your Order') }}:</div>
                                <div class="tac" v-if="productAddedToCart.product">
                                    <div class="miniProductPic" :style="'background-image:url(' + featuredProductPic(productAddedToCart.product) + ');'"></div>

                                    <div class="mtl tac">
                                        <nuxt-link :to="{ name: 'cart-id' }" tag="span">
                                            <el-button
                                                type="primary"
                                                size="small"
                                                round>{{ $t('View My Order') }}</el-button>
                                        </nuxt-link>

                                        <el-button
                                            size="small"
                                            round
                                            class="mlm"
                                            @click="() => { productAddedToCart.showPopover = false }">{{ $t('Hide') }}</el-button>
                                    </div>
                                </div>
                            </el-popover>
                        </nuxt-link>
                    </ul>

                    <!-- <i class="el-icon-d-arrow-right header-hamburger cursorPointer"
                       @click="$store.dispatch('ui/toggleSidebar')"></i>

                    <div class="header-logo-container">
                        <nuxt-link
                            :to="{ name: 'index' }"
                            tag="span"
                            class="cursorPointer">
                            <icon-victory icon-name="logo" class="vam" />
                        </nuxt-link>
                    </div>

                    <ul class="header-nav tar">
                        <li class="header-label">test</li>

                        <nuxt-link
                            :to="{ name: 'cart-id' }"
                            tag="li"
                            class="header-label"
                            :class="{'bounce': numCartItems}">

                            <el-popover
                                v-model="productAddedToCart.showPopover"
                                placement="bottom"
                                width="250"
                                trigger="manual">
                                <span slot="reference" class="cart-button">
                                    <icon-cart icon-name="shopping_cart" class-name="fillWhite" width="35px" height="35px" />
                                    <span class="badge" :class="{'badge-green': numCartItems}">{{ numCartItems }}</span>
                                </span>

                                <div class="tac fw500 fs16 mbm">{{ $t('Added To Your Order') }}:</div>
                                <div class="tac" v-if="productAddedToCart.product">
                                    <div class="miniProductPic" :style="'background-image:url(' + featuredProductPic(productAddedToCart.product) + ');'"></div>

                                    <div class="mtl tac">
                                        <nuxt-link :to="{ name: 'cart-id' }" tag="span">
                                            <el-button
                                                type="primary"
                                                size="small"
                                                round>{{ $t('View My Order') }}</el-button>
                                        </nuxt-link>

                                        <el-button
                                            size="small"
                                            round
                                            class="mlm"
                                            @click="() => { productAddedToCart.showPopover = false }">{{ $t('Hide') }}</el-button>
                                    </div>
                                </div>
                            </el-popover>
                        </nuxt-link>
                    </ul> -->
                </template>

                <!-- checkout header -->
                <template v-else>
                    <div class="header-logo-container">
                        <app-header-checkout-popover>
                            <icon-victory icon-name="logo" class-name="fillGray" class="vam" />
                        </app-header-checkout-popover>
                    </div>

                    <div class="header-checkout-middle" v-if="numCartItems">
                        <span>{{ $t('Checkout') }}</span>
                        <app-header-checkout-popover>
                            (<a class="nowrap fs20">{{ numCartItems }}&nbsp;{{ $tc('items', numCartItems) }}</a>)
                        </app-header-checkout-popover>
                    </div>

                    <div>
                        <icon-lock icon-name="secure" class-name="fillGray" class="vam" width="25px" />
                    </div>
                </template>

            </div>
        </header>
    </headroom>
</template>


<style lang="scss" scoped>
@import "~assets/css/components/_variables.scss";
@import "~assets/css/components/_mixins.scss";

$header-height: 75px;
$header-height-small: 55px;

header {
    @include flex-basis(auto);
    transition: .5s;
    position: relative;
    height: $header-height;
    line-height: $header-height;
    padding: 0;
    background: rgba(255,255,255,0.95);
    border-bottom: 1px solid #dcdada;
}

header:after {
    // background: linear-gradient(to right, #e84f47 25%, #ffcd02 30%, #ffcd02 70%, #0792d8 75%);
    background: linear-gradient(to right, #e84f47 30%, #ffcd02 33%, #ffcd02 66%, #0792d8 69%);
    position: absolute;
    content: '';
    height: 1px;
    right: 0;
    left: 0;
    top: 0;
}

.bv-header-inner {
    @include flexbox();
    @include flex-wrap(nowrap);
    @include flex-direction(row);
    @include align-items(center);
    padding: 0;
    font-size: 15px;
    height: 100%;
    // max-width: $header-max-width;

    .bv-header-nav-list {
        height: $header-height;
        width: 100%;
        @include flexbox();
        @include justify-content(space-between);
        list-style: none;
        margin: 0;
        padding: 0 10px;

        .bv-header-nav-item {
            box-sizing: border-box;
            display: inline-block;
            height: $header-height;
            font-weight: normal;
            // @include flex-grow(1);
            text-align: center;
            position: relative;

            .active-icon {
                display: none;
            }

            &.active {
                .active-icon {
                    display: block;
                    text-align: center;
                    line-height: 10px;
                    position: relative;
                    top: -30px;
                }
            }

            &.bv-header-breadvan {
                width: 60px;
                text-align: center;
            }

        }
    }
    .header-hamburger {
        display: none;
    }

    .header-logo-container {
        @include flex-grow(0);
    }

    .header-checkout-middle {
        @include flex-grow(1);
        text-align: center;
        font-size: 25px;
        font-weight: 400;
    }

    .header-label {
        line-height: $header-height;
        letter-spacing: 1.1px;
        display: inline-block;
    }

    .header-nav {
        @include flex-grow(3);
        display: inline-block;
        margin-left: 30px;

        li {
            display: inline-block;
            list-style: none;
            padding: 0;
            text-transform: uppercase;
            text-decoration: none;
            cursor: pointer;
            padding-right: 10px;
            height: $header-height;
        }
    }

    .cart-button {
        position: relative;
        top: 12px;

        .badge {
            background-color: #a4a5a3;
            border-radius: 10px;
            color: #000;
            display: inline-block;
            font-size: 14px;
            height: 20px;
            min-width: 20px;
            line-height: 19px;
            padding: 0 5px 0 5px;
            text-align: center;
            white-space: nowrap;
            position: absolute;
            top: -20px;
            right: -11px;
            letter-spacing: normal;
        }

        .badge-green {
            background-color: #55c120;
            color: #fff;
        }

        svg {
            margin-top: -20px;
        }
    }
}

.miniProductPic {
    width: 128px;
    min-height: 128px;
    background-size: cover;
    background-position: center;
    display: inline-block;
}



@media #{$medium-and-down} {
    header {
        height: $header-height-small;

        .bv-header-inner {
            padding: 0 10px;
            font-size: 14px;


            .header-hamburger {
                font-size: 25px;
                font-weight: 600;
                margin: 0 5px;
                display: inline-block;
            }

            .header-logo-container {
                @include flex-grow(3);
                text-align: center;

                svg {
                    width: 50px;
                }
            }

            .header-nav {
                // display: inline-block;
                @include flex-grow(0);
                margin-left: 0;
            }

            .header-label {
                line-height: $header-height-small;
            }

            .cart-button {
                top: 12px;

                svg {
                    width: 30px !important;
                }
            }
        }
    }
}
</style>
