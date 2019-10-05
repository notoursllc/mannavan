<script>
import { mapGetters } from 'vuex'
import product_mixin from '@/mixins/product_mixin';

export default {
    components: {
        IconCap: () => import('@/components/icons/IconCap'),
        IconTshirt: () => import('@/components/icons/IconTshirt'),
        IconCart: () => import('@/components/icons/IconCart')
    },

    mixins: [
        product_mixin
    ],

    computed: {
        ...mapGetters({
            numCartItems: 'shoppingcart/numItems',
        }),

        productSubTypes() {
            return this.getProductSubTypes(true);
        }
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
                v-for="(obj, type) in productSubTypes"
                :key="obj.id"
                :route="{ name: 'productSubType', params: { productSubType: obj.slug } }"
                :index="type"
                @click="onMenuItemClick">{{ $t(type) }}</el-menu-item>

            <!-- all products -->
            <el-menu-item
                :route="{ name: 'index' }"
                index="index"
                @click="onMenuItemClick">
                {{ $t('All products') }}
            </el-menu-item>

            <!-- shopping cart -->
            <el-menu-item
                :route="{ name: 'cart-id' }"
                index="cart-id"
                @click="onMenuItemClick">
                &nbsp;&nbsp;&nbsp;&nbsp;{{ $t('Cart') }}
                <icon-cart icon-name="shopping_cart" class-name="fillWhite" width="25px" height="25px" />
                <span v-if="numCartItems"
                    :class="{'badge-green': numCartItems}"
                    class="badge">{{ numCartItems }}</span>
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
    width: 350px;
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

        .badge {
            background-color: #a4a5a3;
            border-radius: 20px;
            color: #000;
            display: inline-block;
            font-size: 16px;
            height: 22px;
            min-width: 22px;
            line-height: 22px;
            padding: 0 5px 0 5px;
            text-align: center;
            white-space: nowrap;
            position: relative;
            top: -8px;
            right: 20px;
            letter-spacing: normal;
        }

        .badge-green {
            background-color: #55c120;
            color: #fff;
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
