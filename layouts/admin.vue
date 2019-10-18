<script>
import { mapState } from 'vuex'
import IconVictory from '@/components/icons/IconVictory'


export default {
    components: {
        IconVictory
    },

    methods: {
        handleResize: function() {
            this.$store.dispatch('ui/windowResize');
        },

        menuItemClick() {
            if(this.$store.state.ui.isMobile) {
                this.$store.dispatch('ui/closeSidebar');
            }
        },

        logout: function() {
            this.$store.dispatch('auth/LOGOUT');
            this.$router.push({ name: 'home' });
        }
    },

    computed: {
        ...mapState({
            sidebarOpened: state => {
                return state.ui.sidebarOpened
            }
        })
    },

    created: function () {
        if (process.browser) {
            window.addEventListener('resize', this.handleResize)
        }
    },

    destroyed () {
        if (process.browser) {
            window.removeEventListener('resize', this.handleResize);
        }
    },

    watch: {
        $route() {
            this.$store.dispatch('ui/CLOSE_MESSAGE_INSTANCES');
        }
    }
}
</script>


<template>
    <div class="layoutContainer">
        <div class="sidenav-container">
            <aside class="sidenav" :class="{'sidenav-fixed': $store.state.ui.sidebarOpened}">
                <div class="sidenav-header ptm">
                    <icon-victory icon-name="logo" class-name="fillWhite" width="60px" />
                </div>

                <el-menu
                    :router="true"
                    background-color="#304156"
                    text-color="#fff"
                    active-text-color="#ffd04b">

                    <el-submenu index="categories_menu">
                        <template slot="title">
                            <span>Categories</span>
                        </template>

                        <el-menu-item
                            :route="{ name: 'acts-categories-product-types' }"
                            index="productTypes"
                            @click="menuItemClick">Product Types</el-menu-item>

                        <el-menu-item
                            :route="{ name: 'acts-categories-product-sub-types' }"
                            index="productSubTypes"
                            @click="menuItemClick">Product Sub-Types</el-menu-item>

                        <el-menu-item
                            :route="{ name: 'acts-categories-packagetypes' }"
                            index="shippingPackageTypes"
                            @click="menuItemClick">Shipping Package Types</el-menu-item>

                        <el-menu-item
                            :route="{ name: 'acts-categories-fit-types' }"
                            index="fitTypes"
                            @click="menuItemClick">Fit Types</el-menu-item>

                        <el-menu-item
                            :route="{ name: 'acts-categories-material-types' }"
                            index="fitTypes"
                            @click="menuItemClick">Material Types</el-menu-item>
                    </el-submenu>

                    <el-submenu index="1">
                        <template slot="title">
                            <span>Product</span>
                        </template>

                        <el-menu-item
                            :route="{ name: 'acts-product-list' }"
                            index="/products"
                            @click="menuItemClick">List</el-menu-item>

                        <el-menu-item
                            :route="{ name: 'acts-product-artist-list' }"
                            index="/product-artists"
                            @click="menuItemClick">Artists</el-menu-item>
                    </el-submenu>

                    <el-menu-item
                        :route="{ name: 'acts-tax-list' }"
                        index="/taxes"
                        @click="menuItemClick">Taxes</el-menu-item>

                    <el-menu-item
                        :route="{ name: 'acts-order-list' }"
                        index="/orders"
                        @click="menuItemClick">Payments</el-menu-item>

                    <el-menu-item
                        :route="{ name: 'acts-reports' }"
                        index="/reports"
                        @click="menuItemClick">Reports</el-menu-item>
                </el-menu>
            </aside>

            <div class="sidenav-overlay"
                v-if="$store.state.ui.sidebarOpened"
                @click="$store.dispatch('ui/closeSidebar')"></div>
        </div>

        <header role="banner" class="header" :class="{'sidenav-opened': $store.state.ui.sidebarOpened}">
            <div class="header-container">
                <i class="colorGrayLighter fs20 cursorPointer"
                    aria-hidden="true"
                    @click="$store.dispatch('ui/toggleSidebar')">toggle sidebar</i>

                <nav class="navigation">
                    <ul class="navigation-list">
                        <li>
                            <el-button type="text"
                                @click="logout"
                                class="colorBlack">{{ $t('LOGOUT') }}</el-button>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>

        <main :class="{'sidenav-opened': $store.state.ui.sidebarOpened}">
            <div class="mainContent">
                <nuxt/>
            </div>
        </main>
    </div>
</template>


<style lang="scss" scoped>
$sidenav-width: 225px;
$header-height: 50px;

@import "~assets/css/components/_variables.scss";
@import "~assets/css/components/_mixins.scss";
@import "~assets/css/components/_sidenav.scss";


.layoutContainer {
    header, main {
        transition: .5s;
    }

    .mainContent {
        padding: 20px 20px 100px 20px; // need some bottom padding to accommodate FAB buttons
    }

    .header {
        background-color: #fff;
        position: relative;
        color: #333;
        line-height: $header-height;
    }

    .header-container {
        @include flexbox();
        @include flex-wrap(nowrap);
        @include flex-direction(row);
        padding: 0 20px;
    }

    .navigation {
        background-color: white;
        padding: 0;
        color: #010101;
        width: auto;
        @include order(2);
        @include flex-grow(2);
        @include align-items(center);
        @include justify-content(flex-end);
        @include flexbox();
    }
}
</style>
