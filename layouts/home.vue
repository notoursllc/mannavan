<script>
import SvgSprite from '@/components/icons/SvgSprite';
import AppHeader from '@/components/AppHeader';
import AppFooter from '@/components/AppFooter';
import AppSidenav from '@/components/AppSidenav';

export default {
    components: {
        SvgSprite,
        AppHeader,
        AppFooter,
        AppSidenav
    },

    watch: {
        $route() {
            this.$store.dispatch('ui/CLOSE_MESSAGE_INSTANCES');
        }
    },

    created() {
        this.$store.dispatch('ui/closeSidebar');
    }
};
</script>


<template>
    <div class="layoutContainer">
        <svg-sprite />

        <app-sidenav />
        <app-header />

        <main>
            <!-- <nuxt keep-alive /> -->
            <nuxt />
        </main>

        <app-footer />
    </div>
</template>


<style lang="scss" scoped>
@import "~assets/css/components/_variables.scss";
@import "~assets/css/components/_mixins.scss";

#__nuxt,
#__layout,
.layoutContainer {
    @include flexbox();
    @include flex-direction(column);
    // use height instead of min-height because of an IE10-11 flex bug:
    // https://github.com/philipwalton/flexbugs#flexbug-3
    height: 100vh;

    main {
        @include flex-grow(1);
    }

}
</style>
