<script>
import { mapGetters } from 'vuex';
import { headroom } from 'vue-headroom'

export default {
    components: {
        IconVictory: () => import('@/components/icons/IconVictory'),
        IconLock: () => import('@/components/icons/IconLock'),
        IconCart: () => import('@/components/icons/IconCart'),
        AppHeaderCheckoutPopover: () => import('@/components/AppHeaderCheckoutPopover'),
        headroom
    },

    data: function() {
        return {
            productAddedToCart: {
                showPopover: false,
                product: null
            }
        }
    },

    computed: {
        ...mapGetters({
            numCartItems: 'shoppingcart/numItems',
            inCheckoutFlow: 'ui/inCheckoutFlow'
        })
    },

    created() {
        const onProductAddedToCart = (product) => {
            this.productAddedToCart.product = product;
            this.productAddedToCart.showPopover = true;
        };

        this.$nuxt.$on('PRODUCT_ADDED_TO_CART', onProductAddedToCart)

        this.$once("hook:beforeDestroy", () => {
            this.$nuxt.$off('PRODUCT_ADDED_TO_CART', onProductAddedToCart);
        });
    }
}
</script>

<template>
    <headroom :disabled="inCheckoutFlow" :zIndex="10">
        <header role="banner" :class="{'white': inCheckoutFlow, 'dark': !inCheckoutFlow}">
            <div class="header-inner">

                <!-- common header -->
                <template v-if="!inCheckoutFlow">
                    <i class="el-icon-d-arrow-right header-hamburger cursorPointer"
                    @click="$store.dispatch('ui/toggleSidebar')"></i>

                    <div class="header-logo-container">
                        <nuxt-link
                            :to="{ name: 'index' }"
                            tag="span"
                            class="cursorPointer">
                            <icon-victory icon-name="logo" class-name="fillWhite" class="vam" />
                        </nuxt-link>
                    </div>

                    <ul class="header-nav tar">
                        <nuxt-link
                            :to="{ name: 'cart-id' }"
                            tag="li"
                            class="header-label">
                            <el-popover
                                v-model="productAddedToCart.showPopover"
                                placement="bottom"
                                width="300"
                                trigger="manual">
                                <span slot="reference"
                                    class="cart-button"
                                    :class="{'bounce': numCartItems}">
                                    <icon-cart icon-name="shopping_cart" class-name="fillWhite" width="35px" height="35px" />
                                    <span class="badge" :class="{'badge-green': numCartItems}">{{ numCartItems }}</span>
                                </span>

                                <div class="tac fw500 fs16 mbs">{{ $t('Item added!') }}</div>
                                <div class="tac" v-if="productAddedToCart.product">
                                      TODO: show mini cart item here<br/>
                                      {{ productAddedToCart.product.title }}

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

$header-height: 55px;
$header-height-small: 46px;

header {
    @include flex-basis(auto);
    transition: .5s;
    position: relative;
    height: $header-height;
    line-height: $header-height;
    padding: 0;
}

header.dark {
    background: #5a5a5a;
    color: #fff;
}

header.white {
    background: #fff;
    border-bottom: 1px solid #ece9e9;
}

header:after {
    background: linear-gradient(to right, #e84f47 25%, #ffcd02 30%, #ffcd02 70%, #0792d8 75%);
    position: absolute;
    content: '';
    height: 4px;
    right: 0;
    left: 0;
    top: 0;
}

.header-inner {
    @include flexbox();
    @include flex-wrap(nowrap);
    @include flex-direction(row);
    @include align-items(center);
    padding: 0 20px;
    font-size: 15px;
    height: 100%;
    font-weight: 600;
    margin: 0 auto;
    max-width: $header-max-width;

    .header-hamburger {
        display: none;
    }

    .header-logo-container {
        @include flex-grow(0);

        svg {
            width: 65px;
        }
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

        svg {
            width: 40px !important;
        }

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
            right: -10px;
            letter-spacing: normal;
        }

        .badge-green {
            background-color: #55c120;
            color: #fff;
        }
    }
}



@media #{$medium-and-down} {
    header {
        height: $header-height-small;

        .header-inner {
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
