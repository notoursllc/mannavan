<script>
import { FigSlideover } from '@notoursllc/figleaf';

export default {
    components: {
        FigSlideover
    },

    computed: {
        productSubTypes() {
            return this.$store.state.product.subTypes;
        }
    },

    methods: {
        onLinkClick(e) {
            e.preventDefault;
            this.$emit('nav', e)
        }
    }
};
</script>


<template>
    <fig-slideover
        :opened="$store.state.ui.sidebarOpened"
        @close="() => { $store.dispatch('ui/closeSidebar') }"
        class="bg-gray-800">

        <nav class="px-10 w-full block">
            <div v-for="(obj, type) in productSubTypes" :key="obj.id" class="my-4">
                <nuxt-link
                    :to="{ name: 'productSubType', params: { productSubType: obj.slug } }"
                    tag="a"
                    class="slideover-link"
                    active-class="active"
                    @click.native="onLinkClick">{{ $t(type) }}</nuxt-link>
            </div>

            <div class="my-4">
                <nuxt-link
                    :to="{ name: 'index' }"
                    tag="a"
                    class="slideover-link"
                    @click.native="onLinkClick">{{ $t('All') }}</nuxt-link>
            </div>
        </nav>

        <!-- <div slot="footer">FOOTER GOES HERE</div> -->
    </fig-slideover>
</template>


<style lang="postcss" scoped>
.slideover-link {
    @apply font-semibold text-center mr-5 text-white text-xl block;
}
</style>
