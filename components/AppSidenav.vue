<script>
import Vue from 'vue';
import { mapGetters } from 'vuex'
import { Menu, MenuItem } from 'element-ui';
import product_mixin from '@/mixins/product_mixin';
import IconCap from '@/components/icons/IconCap'
import IconTshirt from '@/components/icons/IconTshirt'
import IconCart from '@/components/icons/IconCart'

Vue.use(Menu);
Vue.use(MenuItem);

export default {
    components: {
        IconCap,
        IconTshirt,
        IconCart
    },

    mixins: [
        product_mixin
    ],

    computed: {
        ...mapGetters({
            numCartItems: 'shoppingcart/numItems',
        })
    },

    methods: {
        onMenuItemClick() {
            this.$store.dispatch('ui/closeSidebar');
        }
    }
}
</script>

<template>
    <aside class="sidenav" :class="{'sidenav-fixed': $store.state.ui.sidebarOpened}">
        <div class="pal tar colorWhite">
            <i class="el-icon-close cursorPointer" @click="onMenuItemClick"></i>
        </div>

        <el-menu
            :router="true"
            background-color="#304156"
            text-color="#fff"
            class="sidenav-menu-main">
            <el-menu-item
                v-for="(index, type) in getProductSubTypes()"
                :key="type"
                :route="{ name: 'productSubType', params: { productSubType: getUrlPathForProductSubType(type) } }"
                :index="type"
                @click="onMenuItemClick">{{ $tc(type, 2) }}</el-menu-item>
        </el-menu>

        <el-menu
            :router="true"
            background-color="#304156"
            text-color="#fff">
            <el-menu-item
                :route="{ name: 'cart-id' }"
                index="cart-id"
                @click="onMenuItemClick">
                <icon-cart icon-name="shopping_cart" class-name="fillWhite" width="25px" height="25px" />
                {{ $t('Cart') }}
                <span v-if="numCartItems">({{ numCartItems }})</span>
            </el-menu-item>
        </el-menu>
    </aside>
</template>


<style lang="scss" scoped>
@import "~assets/css/components/_variables.scss";
@import "~assets/css/components/_mixins.scss";

.sidenav {
    height: 100%;
    height: calc(100% + 60px);
    height: -moz-calc(100%); //Temporary Firefox Fix
}

.sidenav {
    position: fixed;
    width: 400px;
    left: 0;
    top: 0;
    margin: 0;
    padding: 0 0 60px 0;
    background-color: #304156;
    overflow-y: auto;
    text-align: center;
    transform: translateX(-105%);
    transition: .5s;
    z-index: 1;

    .el-menu-item {
        font-size: 18px;

        svg {
            margin-bottom: -5px;
            margin-right: 5px;
        }
    }

    .sidenav-menu-main .el-menu-item {
        font-size: 27px;
    }
}

.el-icon-close {
    font-size: 30px;
}

.sidenav-fixed {
    transform: translateX(0);
    transition: .5s;
}

.el-menu {
    border: 0;
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

// Fixed Sidenav hide on smaller
@media #{$medium-and-down} {
    .sidenav {
        &.sidenav-fixed {
            // transform: translateX(-105%);
            z-index: 999;
        }
    }
}
</style>
