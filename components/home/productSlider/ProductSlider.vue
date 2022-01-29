
<script>
import ProductCard from '@/components/product/ProductCard.vue';
import VueHorizontal from 'vue-horizontal';

import {
    FigOverlay,
    FigIcon
} from '@notoursllc/figleaf';

export default {
    name: 'ProductSlider',

    components: {
        FigOverlay,
        FigIcon,
        ProductCard,
        VueHorizontal
    },

    props: {
        products: {
            type: Array,
            default() {
                return []
            }
        },

        loading: {
            type: Boolean,
            default: false
        }
    },

    data() {
        return {
        };
    }
}
</script>


<template>
    <div class="product-slider" v-if="products && products.length">
        <fig-overlay :show="loading" size="xl" variant="success" dark>
            <div v-if="$slots.title" class="pb-2">
                <h2 class="text-xl sm:text-2xl font-semibold m-0"><slot name="title"></slot></h2>
            </div>

            <div class="product-slider-slides">
                <vue-horizontal responsive scroll class="horizontal" :displacement="0.7">
                    <template v-slot:btn-prev>
                        <div class="product-slider-btn product-slider-btn-prev">
                            <fig-icon
                                icon="chevron-left"
                                width="36"
                                height="36"
                                stroke-weight="3" />
                        </div>
                    </template>

                    <div
                        v-for="(prod, index) in products"
                        :key="index"
                        :class="`slide--${index}`"
                        class="product-slide">
                        <product-card
                            :product="prod"
                            class="product-slider-item" />
                    </div>

                    <template v-slot:btn-next>
                        <div class="product-slider-btn product-slider-btn-next">
                            <fig-icon
                                icon="chevron-right"
                                width="36"
                                height="36"
                                stroke-weight="3" />
                        </div>
                    </template>
                </vue-horizontal>
            </div>
        </fig-overlay>
    </div>
</template>


<style>
.product-slider {
    @apply p-0 mb-0 mt-6;
}

.product-slider .Slider {
    min-height: 13rem;
}

.product-slider-slides {
    @apply rounded pt-4 px-4;
}

.product-slider-slides .v-hl-btn {
    top: inherit !important;
    bottom: inherit !important;
}

.product-slider-item {
    @apply mb-2;
}

.horizontal .v-hl-container {
    /* Space between content and scrollbar */
    /* padding-bottom: 16px; */

    /* For firefox only */
    scrollbar-width: auto;
    scrollbar-color: transparent transparent;
}
.horizontal .v-hl-container:hover {
    /* For firefox only */
    scrollbar-color: rgb(163, 163, 163) transparent;
}

.horizontal .v-hl-container::-webkit-scrollbar {
    height: 16px;
    width: 16px;
    background: transparent;
}

.horizontal .v-hl-container::-webkit-scrollbar-track {
    @apply rounded;
    background-color: #f3f3f7;
}

.horizontal:hover .v-hl-container::-webkit-scrollbar-thumb {
    @apply bg-gray-400 border-solid border-4 rounded-lg;
    border-color: #f3f3f7;
}

.product-slider-btn {
    @apply bg-white px-2 py-7 absolute rounded-md;
}
.product-slider-btn-prev {
    left: -14px;
}
.product-slider-btn-next {
    right: -14px;
}


/* https://vue-horizontal.fuxing.dev/design/responsive */
.product-slide {
    /* padding: 16px 24px; */
    /* margin-right: 24px; */
    width: 100%;
}

@media (min-width: 640px) {
    .product-slide {
        width: calc((100% - (24px)) / 2);
    }
}

@media (min-width: 768px) {
    .product-slide {
        width: calc((100% - (2 * 24px)) / 2) !important;
    }
}

@media (min-width: 1024px) {
    .product-slide {
        width: calc((100% - (3 * 24px)) / 3) !important;
    }
}

@media (min-width: 1280px) {
    .product-slide {
        width: calc((100% - (4 * 24px)) / 4) !important;
    }
}
</style>
