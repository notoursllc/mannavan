<script>
import AppHeader from '@/components/AppHeader'
import AppFooter from '@/components/AppFooter'
import AppSidenav from '@/components/AppSidenav'

export default {
    components: {
        AppHeader,
        AppFooter,
        AppSidenav
    },

    computed: {
        pageTitle() {
            return this.$store.state.ui.pageTitle;
        }
    },

    created() {
        this.$store.dispatch('ui/closeSidebar')
    }
}
</script>


<template>
    <div class="layoutContainer">
        <app-sidenav />
        <app-header />

        <main>
            <nuxt/>
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
}

.layoutContainer {
    main {
        @include flex-grow(1);
        @include flex-basis(auto);
    }
}

@media #{$medium-and-up} {
    .layoutContainer {
        main {
            @include flex-grow(1);
            @include flex-basis(auto);
            margin-bottom: 50px;
        }
    }
}
</style>
