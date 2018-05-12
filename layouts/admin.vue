<script>
import Vue from 'vue'
import { mapState } from 'vuex'
import { Button, Menu, MenuItem, Submenu } from 'element-ui'

Vue.use(Menu);
Vue.use(Submenu);
Vue.use(MenuItem);
Vue.use(Button);

export default {
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
    }
}
</script>


<template>
    <div class="layoutContainer">
        <div class="sidenav-container">
            <aside class="sidenav" :class="{'sidenav-fixed': $store.state.ui.sidebarOpened}">
                <div class="sidenav-header">
                    <img class="header-image cursorPointer"
                        src="/images/logo_header.png"
                        @click="$router.push({ name: 'acts-product-list' })"
                        alt="gmnst" />
                </div>

                <el-menu
                    :router="true"
                    background-color="#304156"
                    text-color="#fff"
                    active-text-color="#ffd04b">

                    <el-submenu index="1">
                        <template slot="title">
                            <i class="fa fa-cubes"></i>
                            <span>{{ $t('Products') }}</span>
                        </template>

                        <el-menu-item
                            :route="{ name: 'acts-product-list' }"
                            index="/products"
                            @click="menuItemClick">List</el-menu-item>
                    </el-submenu>

                    <el-menu-item
                        :route="{ name: 'acts-reports' }"
                        index="/reports"
                        @click="menuItemClick">
                        <i class="fa fa-bar-chart"></i>
                        <span>{{ $t('Reports') }}</span>
                    </el-menu-item>
                </el-menu>
            </aside>

            <div class="sidenav-overlay"
                v-if="$store.state.ui.sidebarOpened"
                @click="$store.dispatch('ui/closeSidebar')"></div>
        </div>

        <header role="banner" class="header" :class="{'sidenav-opened': $store.state.ui.sidebarOpened}">
            <div class="header-container">
                <i class="fa fa-bars colorGrayLighter fs20 cursorPointer"
                    aria-hidden="true"
                    @click="$store.dispatch('ui/toggleSidebar')"></i>

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
            <nuxt/>
        </main>
    </div>
</template>


<style lang="scss" scoped>
@import "~assets/css/components/_variables.scss";
@import "~assets/css/components/_mixins.scss";

$sidenav-width-admin: 160px;

.layoutContainer {

    header, main {
        transition: .5s;
    }

    @media #{$medium-and-up} {
        .sidenav-opened {
            padding-left: $sidenav-width-admin;
            transition: .5s;
        }
    }

    .fa-bars {
        line-height: 60px;
    }

    .header {
        background-color: #fff;
        position: relative;
        color: #333;
        line-height: 60px;
    }

    .header-container {
        @include flexbox();
        @include flex-wrap(nowrap);
        flex-direction: row;
        padding: 0 20px;
    }

    .header-image {
        display: inline-block;
        width: 120px;
        vertical-align: middle;
    }

    .header-image {
        @include grow()
    }
    .header-image:hover {
        @include growHover()
    }

    .navigation {
        background-color: white;
        padding: 0;
        color: #010101;
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

    .navigation-list {
        @include flexbox();
        @include justify-content(space-around);
        @include align-self(center);
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
            height: 60px;
            line-height: 60px;

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

    .sidenav-container,
    .sidenav {
        height: 100%;
        height: calc(100% + 60px);
        height: -moz-calc(100%); //Temporary Firefox Fix
    }
    .sidenav {
        position: fixed;
        width: $sidenav-width-admin;
        left: 0;
        top: 0;
        margin: 0;
        padding-bottom: 60px;
        background-color: #304156;
        overflow-y: auto;
        transform: translateX(-105%);
        transition: .5s;
        z-index: 1;

        .sidenav-header {
            height: 60px;
            line-height: 60px;
            text-align: center;
            background-color: rgba(0,0,0,.1);
        }
    }

    .sidenav.sidenav-fixed {
        transform: translateX(0);
        transition: .5s;
    }

    .sidenav-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        opacity: 0;
        height: 120vh;
        background-color: rgba(0,0,0,.5);
        z-index: 997;
        display: none;
    }

    .el-menu {
        border: 0;

        .fa {
            vertical-align: middle;
            margin-right: 10px;
        }
    }

    // Fixed Sidenav hide on smaller
    @media #{$medium-and-down} {
        .sidenav {
            &.sidenav-fixed {
                // transform: translateX(-105%);
                z-index: 999;
            }
        }

        .sidenav-overlay {
            opacity: 1;
            display: block;
        }
    }
}
</style>
