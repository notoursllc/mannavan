<script>
import { mapGetters } from 'vuex';
import product_mixin from '@/mixins/product_mixin';
import IconVictory from '@/components/icons/IconVictory';
import IconCart from '@/components/icons/IconCart';

export default {
    mixins: [
        product_mixin
    ],

    components: {
        IconVictory,
        IconCart
    },

    computed: {
        ...mapGetters({
            numCartItems: 'shoppingcart/numItems',
        })
    }
}
</script>

<template>
    <header role="banner">
        <div class="header-inner">

            <i class="el-icon-d-arrow-right header-hamburger cursorPointer"
            @click="$store.dispatch('ui/toggleSidebar')"></i>

            <div class="header-logo-container">
                <nuxt-link
                    :to="{ name: 'index' }"
                    tag="span"
                    class="cursorPointer header-logo">
                    <icon-victory icon-name="logo" class-name="fillWhite" class="vam" />
                </nuxt-link>
            </div>

            <ul class="header-nav tar">
                <nuxt-link
                    :to="{ name: 'cart-id' }"
                    tag="li"
                    class="header-label">
                    <div class="cart-button" :class="{'bounce': numCartItems}">
                        <icon-cart icon-name="shopping_cart" class-name="fillWhite" width="35px" height="35px" />
                        <span class="badge" :class="{'badge-green': numCartItems}">{{ numCartItems }}</span>
                    </div>
                </nuxt-link>
            </ul>

        </div>
    </header>
</template>


<style lang="scss" scoped>
@import "~assets/css/components/_variables.scss";
@import "~assets/css/components/_mixins.scss";

$header-height: 55px;
$header-height-small: 46px;

header {
    transition: .5s;
    // background: #424345;
    background: #5a5a5a;
    position: relative;
    color: #fff;
    height: $header-height-small;
    padding: 0;
    z-index: 10;
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
    padding: 0 10px;
    height: 100%;
    font-size: 14px;
    font-weight: 600;
    margin: 0 auto;
    max-width: 1568px;

    .header-hamburger {
        font-size: 25px;
        font-weight: 600;
        margin: 0 5px;
    }

    .header-logo-container {
        @include flex-grow(3);
        text-align: center;

        .header-logo {
            svg {
                width: 50px;
            }
        }
    }

    .header-label {
        line-height: $header-height-small;
        letter-spacing: 1.1px;
        display: inline-block;
    }

    .header-nav {
        display: none;
        margin: 0;

        li {
            display: inline-block;
            list-style: none;
            padding: 0;
            text-transform: uppercase;
            text-decoration: none;
            cursor: pointer;
            padding: 0 10px;
            height: $header-height;
        }
    }
}

.cart-button {
    position: relative;
    padding-top: 12px;

    svg {
        width: 32px;
    }

    .badge {
        background-color: #a4a5a3;
        border-radius: 10px;
        color: #000;
        display: inline-block;
        font-size: 14px;
        height: 20px;
        min-width: 20px;
        line-height: 20px;
        padding: 0 5px 0 5px;
        text-align: center;
        white-space: nowrap;
        position: absolute;
        top: 8px;
        right: -12px;
        letter-spacing: normal;
    }

    .badge-green {
        background-color: #55c120;
        color: #fff;
    }
}

@media #{$medium-and-up} {
    header {
        height: $header-height;

        .header-inner {
            padding: 0 20px;
            font-size: 15px;

            .header-hamburger {
                display: none;
            }

            .header-logo-container {
                @include flex-grow(0);

                .header-logo {
                    svg {
                        width: 65px;
                    }
                }
            }

            .header-nav {
                display: inline-block;
                @include flex-grow(3);
                margin-left: 30px;
            }

            .header-label {
                line-height: $header-height;
            }
        }
    }
}
</style>
