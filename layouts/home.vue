<script>
import AppHeader from '@/components/AppHeader';
import AppFooter from '@/components/AppFooter';
import AppSidenav from '@/components/AppSidenav';

import {
    FigIconSprite
} from '@notoursllc/figleaf';

export default {
    components: {
        FigIconSprite,
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
        <fig-icon-sprite />

        <app-sidenav />
        <app-header />

        <main class="flex-grow">
            <!-- <nuxt keep-alive /> -->
            <nuxt />
        </main>

        <app-footer />
    </div>
</template>


<style lang="postcss" scoped>
#__nuxt,
#__layout,
.layoutContainer {
    @apply flex flex-col h-screen;
}
</style>
