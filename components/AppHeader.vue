<script>
    import Vue from 'vue';
    import { mapGetters } from 'vuex';
    import isObject from 'lodash.isobject'
    import { Popover, Button } from 'element-ui'
    import ProductPrice from '@/components/product/ProductPrice.vue'
    import product_mixin from '@/mixins/product_mixin'

    Vue.use(Popover);
    Vue.use(Button);

    export default {
        components: {
            ProductPrice
        },

        mixins: [
            product_mixin
        ],

        data() {
            return {
                headerPopoverVisible: false
            }
        },

        computed: {
            ...mapGetters({
                numCartItems: 'shoppingcart/numItems',
                inCheckoutFlow: 'ui/inCheckoutFlow'
            })
        },

        methods: {
            goHome: function() {
                this.$router.push({ name: 'index' });
            },

            goToCart() {
                return this.$router.push({ name: 'cart-id' });
            },

            dispatchCheckoutFlow: function(route) {
                let isCheckoutPage = (isObject(route) && route.name && route.name.indexOf('checkout') === 0);
                this.$store.dispatch('ui/IN_CHECKOUT_FLOW', isCheckoutPage);
            }
        },

        mounted: function() {
            this.dispatchCheckoutFlow(this.$route)
        },

        watch: {
            // React to route param changes:
            '$route' (to, from) {
                this.dispatchCheckoutFlow(to);
            }
        }
    }
</script>


<template>
    <div>
        <template v-if="!inCheckoutFlow">
            <header role="banner" class="Header">
                <div class="Header-container">
                    <div class="Header-brand">
                        <img class="Header-image cursorPointer" @click="goHome" src="/images/logo_header.png" alt="gmnst" />
                    </div>

                    <a class="Header-cart" @click="goToCart">
                        <i class="fa fa-shopping-cart fs30"></i>
                        <span class="badge">{{ numCartItems }}</span>
                    </a>

                    <nav class="Navigation">
                        <ul class="Navigation-list">
                            <nuxt-link
                                v-for="(obj, key) in getProductSubTypeData()"
                                :key="key"
                                :to="{ name: 'type-name', params: { name: obj.label } }"
                                tag="li"
                                active-class="active">{{ $tc(key, 2) }}</nuxt-link>
                        </ul>
                    </nav>
                </div>
            </header>
        </template>
        <template v-else>
            <header role="banner" class="Header-checkout">
                <div class="container">
                    <div class="displayTable widthAll">
                        <div class="Header-checkout-cell">
                            <img class="Header-image cursorPointer" @click="goHome" src="/images/logo_header.png" alt="gmnst">
                        </div>
                        <div class="Header-checkout-cell tac colorBlack" v-if="numCartItems">
                            <span>{{ $t('Checkout') }}</span>
                            <span class="nowrap">(<a @click="headerPopoverVisible = true">{{ numCartItems }}&nbsp;{{ $tc('items', numCartItems) }}</a>)</span>
                            <el-popover
                                ref="headerpopover"
                                placement="bottom"
                                offset="100"
                                v-model="headerPopoverVisible">
                                <div class="tac">
                                    <div class="fs14">{{ $t('Are you sure you want to return to your Shopping Cart?') }}</div>
                                    <el-button plain @click="headerPopoverVisible = false" class="mtm">{{ $t('Stay in checkout') }}</el-button>
                                    <el-button type="warning" @click="headerPopoverVisible = false; goToCart()" class="mtm colorBlack">{{ $t('Return to cart') }}</el-button>
                                </div>
                            </el-popover>
                        </div>
                        <div class="Header-checkout-cell tar">
                            <span class="icon is-medium vam"><i class="fa fa-lock colorGray fs30"></i></span>
                        </div>
                    </div>
                </div>
            </header>
        </template>
    </div>
</template>


<style lang="scss">
    @import "~assets/css/components/_variables.scss";
    @import "~assets/css/components/_mixins.scss";

    .Header,
    .Header-checkout {
        background-color: #fff;
        // box-shadow: 0 1px 1px rgba(10, 10, 10, 0.1);
        position: relative;
    }

    .Header-checkout-cell {
        display: table-cell;
        width: 33%;
        padding: 0;
        vertical-align: middle;
        padding: 0 5px;
        height: 73px;
        font-size: 22px;

        // Center the popover
        .el-popover {
            left: 50%;
            transform: translate(-50%, 10%);
        }
    }

    .Header-container {
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        -ms-flex-wrap: wrap;
        flex-wrap: wrap;
        flex-direction: row;
    }

    .Header-brand {
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        -webkit-box-align: center;
        -ms-flex-align: center;
        flex-grow: 1;
        align-items: center;
        color: #02182B;
        margin-left: 20px;
    }

    .Header-image {
        display: inline-block;
        width: 180px;
        vertical-align: middle;
    }

    .Header-image,
    .Header-cart {
        @include grow()
    }
    .Header-image:hover,
    .Header-cart:hover i {
        @include growHover()
    }

    .Header-cart {
        font-family: Helvetica, Arial, sans-serif;
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        -webkit-box-pack: center;
        -ms-flex-pack: center;
        justify-content: center;
        -webkit-box-align: center;
        -ms-flex-align: center;
        align-items: center;
        width: 20%;
        height: 50px;
        background-color: $colorBluePurple;
        margin-left: 0;
        position: relative;

        .icon {
            height: 30px !important;
            color: white !important;
        }

        .fa {
            color: white!important;
        }

        &:hover,
        &:focus {
            background-color: #389955;
        }
    }

    .Navigation {
        background-color: whitesmoke;
        color: #010101;
        width: 100%;
    }

    .Navigation-list {
        display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        -ms-flex-pack: distribute;
        justify-content: space-around;
        -ms-flex-item-align: center;
        align-self: center;
        margin: 0 20px 0 0;
        margin: 0;


        li {
            list-style: none;
            padding: 0;
            text-transform: uppercase;
            color: #7a7a7a;
            font-size: 14px;
            text-decoration: none;
            cursor: pointer;
            padding: 0 10px;
            // height: 50px;
            // line-height: 50px;
            height: 73px; //?
            line-height: 78px; //?

            &:hover,
            &:focus {
                color: #363636;
            }

            &.active {
                border-bottom: 3px solid #41b883;
                color: #000;
            }
        }
    }

    .badge {
        background-color: #ed198a;
        border-radius: 10px;
        color: #fff;
        display: inline-block;
        font-size: 14px;
        height: 18px;
        line-height: 18px;
        padding: 0 6px 0 5px;
        text-align: center;
        white-space: nowrap;
        position: absolute;
        // transform: translateY(50%) translateX(60%);
        box-shadow: 0 0 1px 1px rgba(10, 10, 10, 0.1);
        top: 15px;
        left: 35px;
    }

    @media #{$medium-and-up}  {
        .Header-container {
            -ms-flex-wrap: nowrap;
            flex-wrap: nowrap;
        }
        .Header-brand {
            max-width: 170px;
        }
        .Header-cart {
            -webkit-box-ordinal-group: 4;
            order: 3;
            -ms-flex-order: 3;
            -webkit-flex-order: 3;
            width: auto;
            height: auto;
            padding-left: 1.2em;
            padding-right: 1.5em;
            margin-left: 20px;
        }
        .Navigation {
            background-color: white;
            padding: 0;
            -webkit-box-ordinal-group: 3;
            -ms-flex-order: 2;
            order: 2;
            width: auto;
            -webkit-box-flex: 2;
            -ms-flex-positive: 2;
            flex-grow: 2;
            -webkit-box-align: center;
            -ms-flex-align: center;
            align-items: center;
            -ms-flex-item-align: center;
            align-self: center;
            -webkit-box-pack: end;
            -ms-flex-pack: end;
            justify-content: flex-end;
            display: -webkit-box;
            display: -ms-flexbox;
            display: flex;
        }
        .Navigation-list {
            -webkit-box-pack: end;
            -ms-flex-pack: end;
            justify-content: flex-end;
        }
    }

    @media #{$medium-and-down}  {
        .Header-checkout,
        .Header-checkout-cell {
            height: 50px;
            font-size: 16px;
        }

        .Navigation-list li {
            height: 50px;
            line-height: 50px;
        }

        .Header-image {
            width: 140px;
        }

        // overriding a weird element UI setting:
        .el-button+.el-button {
            margin-left: 5px;
            margin-right: 5px;
        }
    }
</style>
