<script>
import { mapGetters } from 'vuex';
import product_mixin from '@/mixins/product_mixin';
import IconVictory from '@/components/icons/IconVictory';

export default {
    mixins: [
        product_mixin
    ],

    components: {
        IconVictory
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

            <ul class="header-nav">
                <nuxt-link
                    v-for="(obj, key) in getProductSubTypeData()"
                    :key="key"
                    :to="{ name: 'type-name', params: { name: obj.label } }"
                    tag="li"
                    class="header-label"
                    active-class="active">
                    <span>{{ $tc(key, 2) }}</span>
                </nuxt-link>
            </ul>

            <div class="header-cart-dot">
                <nuxt-link
                    :to="{ name: 'cart-id' }"
                    tag="div"
                    class="inlineBlock cursorPointer"
                    active-class="active">
                    <div class="header-label prs">{{ $t('CART') }}</div>
                    <div class="dot">{{ numCartItems }}</div>
                </nuxt-link>
            </div>
        </div>
    </header>
</template>


<style lang="scss" scoped>
@import "~assets/css/components/_variables.scss";
@import "~assets/css/components/_mixins.scss";

$header-height: 57px;
$header-height-small: 46px;

header {
    transition: .5s;
    background: #424345;;
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
    color: #fff;

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
                width: 68px;
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

    .header-cart-dot {
        display: inline-block;
        position: relative;

        .dot {
            display: inline-block;
            height: 34px;
            width: 34px;
            background-color: #fff;
            border-radius: 50%;
            text-align: center;
            color: #2c4656;
            font-size: 22px;
            font-weight: 600;
            @include rotate(25deg);
            position: relative;
            top: 2px;
        }
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
                        width: 78px;
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
