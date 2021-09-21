<script>
import Vue from 'vue';
import AppHeader from '@/components/AppHeader';
import AppFooter from '@/components/AppFooter';
import AppSlideover from '@/components/AppSlideover';

import {
    FigIconSprite,
    FigSlideover
} from '@notoursllc/figleaf';


export default Vue.extend({
    components: {
        FigIconSprite,
        FigSlideover,
        AppHeader,
        AppFooter,
        AppSlideover
    },

    methods: {
        onSlideoverNav() {
            this.$store.dispatch('ui/closeSidebar');
        }
    },

    watch: {
        $route() {
            this.$figleaf.clearToasts();
        }
    },

    created() {
        this.$store.dispatch('ui/closeSidebar');
    }
});
</script>


<template>
    <div class="layoutContainer">
        <fig-icon-sprite />
        <fig-toaster />

        <app-slideover @nav="onSlideoverNav" />
        <app-header />

        <main class="flex-grow">
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
