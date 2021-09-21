<script>
import AppHeader from '@/components/AppHeader';
import AppFooter from '@/components/AppFooter';
import AppSlideover from '@/components/AppSlideover';

import {
    FigIconSprite,
    FigSlideover
} from '@notoursllc/figleaf';

export default {
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

    created() {
        this.$store.dispatch('ui/closeSidebar');
    }
};
</script>


<template>
    <div class="layoutContainer">
        <fig-icon-sprite />
        <fig-toaster />

        <app-slideover @nav="onSlideoverNav" />
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
