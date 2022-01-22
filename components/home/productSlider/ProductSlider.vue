
<script>
import ProductSliderItem from '@/components/home/productSliderItem/ProductSliderItem.vue';
import ProductCard from '@/components/product/ProductCard.vue';

import {
    FigSlider,
    FigOverlay
} from '@notoursllc/figleaf';

export default {
    name: 'ProductSlider',

    components: {
        FigSlider,
        FigOverlay,
        ProductSliderItem,
        ProductCard
    },

    props: {
        products: {
            type: Array,
            default() {
                return []
            }
        },

        requestUrl: {
            String
        },

        loading: {
            type: Boolean,
            default: false
        }
    },

    data() {
        return {
            options: {
                dots: false,
                navButtons: true,
                slidesToShow: 5,
                slidesToScroll: 5,
                slideGrow: false,
                mobileFirst: false,
                infinite: false,
                speed: 300,
                timing: 'ease-in-out',
                extraClass: 'fig-product-slider',
                responsive: [
                    { breakpoint: 576, settings: { slidesToShow: 1, slidesToScroll: 1 } },
                    { breakpoint: 768, settings: { slidesToShow: 2, slidesToScroll: 2 } },
                    { breakpoint: 992, settings: { slidesToShow: 3, slidesToScroll: 3 } },
                    { breakpoint: 1100, settings: { slidesToShow: 4, slidesToScroll: 4 } },
                ],
            }
        };
    },



    watch: {
        products: {
            handler(newVal) {
                if(this.$refs.slider) {
                    setTimeout(() => {
                        this.$refs.slider.reload();
                    })
                }
            },
            immediate: true,
            deep: true
        }
    }
}
</script>


<template>
    <div class="product-slider" v-if="products && products.length">
        <h2 v-if="$slots.title"
            class="text-xl sm:text-2xl font-semibold"><slot name="title"></slot></h2>
        <fig-overlay :show="loading" size="xl" variant="success" dark>
            <fig-slider ref="slider" :options="options">
                <div v-for="(prod, index) in products" :key="index" :class="`slide--${index}`">
                    <product-slider-item :product="prod" />
                    <!-- <product-card :product="prod" class="product-slider-item" /> -->
                </div>
            </fig-slider>
        </fig-overlay>
    </div>
</template>


<style>
.product-slider {
    @apply py-0 px-4 mb-0 mt-6;
}

.product-slider .Slider {
    min-height: 13rem;
}

.fig-product-slider .Slider__slide {
    @apply py-2 px-0;
    transition: all .3s ease-in-out !important;
}

@screen sm {
    .fig-product-slider:hover > * {
        /* transform: scale(1) translate3d(-2rem, 0, 0) !important; */
        opacity: .3;
    }

    .fig-product-slider .Slider__slide {
        @apply py-4 px-0;
    }

    .fig-product-slider .Slider__slide:hover {
        @apply opacity-100;
        /* transform: scale(1.2) !important; */
    }

    /* .fig-product-slider .Slider__slide:hover ~ .Slider__slide {
        transform: translate3d(2rem, 0 , 0) !important;
    } */

    .fig-product-slider .Slider__slide:hover .product-slider-item-details {
        @apply visible opacity-100;
    }

    /* .Slider__slide--last:hover {
        @apply pr-6;
    }
    .Slider__slide--last:hover .product-slider-item {
        @apply mr-0;
    } */
}
</style>
