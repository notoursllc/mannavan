<script>
import Vue from 'vue';
import AppHeader from '@/components/AppHeader';
import AppFooter from '@/components/AppFooter';

import {
    FigIconSprite,
    FigSlideover
} from '@notoursllc/figleaf';


export default Vue.extend({
    components: {
        FigIconSprite,
        FigSlideover,
        AppHeader,
        AppFooter
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

        <fig-slideover
            :opened="$store.state.ui.sidebarOpened"
            @close="() => { $store.dispatch('ui/closeSidebar') }"
            class="bg-gray-800">
            <div>nav goes here</div>
            <div slot="footer">FOOTER GOES HERE</div>
        </fig-slideover>

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
