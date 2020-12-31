<script>
/*
* This component was heavily inspired by watching this video:
* https://www.youtube.com/watch?v=vk69GJUM3Mc
*/

import Vue from 'vue';
import throttle from 'lodash.throttle';
import product_mixin from '@/mixins/product_mixin';

export default Vue.extend({
    props: {
        product: {
            type: Object,
            default: () => {
                return {};
            }
        },

        /**
         * Throttle delay in milliseconds
         */
        throttleDelay: {
            type: Number,
            default: 500
        }
    },

    mixins: [
        product_mixin
    ],

    data() {
        return {
            currentIndex: 0,
            touch: {
                startX: 0,
                endX: 0
            }
        };
    },

    computed: {
        pics() {
            let images = [];

            if(!Array.isArray(this.product.variants) || !this.product.variants.length) {
                return images;
            }

            this.product.variants.forEach((variant) => {
                const variantImages = this.prodMix_getVariantImagesAtWidth(variant, 600);
                if(variantImages.length) {
                    images = images.concat(variantImages);
                }
            });

            return images;
        },

        listLength() {
            return { width: this.countSlides * 100 + '%' };
        },

        listPosition() {
            return { transform: 'translateX(-' + (this.currentIndex * 100) + '%)' };
        },

        countSlides() {
            return this.pics.length;
        },

        canGoToPrev () {
            return this.currentIndex > 0;
        },

        canGoToNext() {
            return this.currentIndex < this.countSlides - 1;
        }
    },

    created () {
        this.goTo = throttle(this.goTo, this.throttleDelay);
        // this.getWidth = throttle(this.getWidth, 500);
    },

    mounted() {
        this.$el.addEventListener('touchstart', (event) => this.onTouchStart(event));
        this.$el.addEventListener('touchmove', (event) => this.onTouchMove(event));
        this.$el.addEventListener('touchend', (event) => this.onTouchEnd(event));
    },

    methods: {
        goTo(index) {
            this.currentIndex = index;
        },

        goToNext() {
            if (this.canGoToNext) {
                this.goTo(this.currentIndex + 1);
            }
        },

        goToPrev() {
            if (this.canGoToPrev) {
                this.goTo(this.currentIndex - 1);
            }
        },

        onTouchStart(e) {
            this.touch.startX = e.touches[0].clientX;
            this.touch.endX = 0;
        },

        onTouchMove(e) {
            this.touch.endX = e.touches[0].clientX;
        },

        onTouchEnd() {
            // a swipe distance of more than 20 pix is needed in order to move the
            // slides, otherwise it's too sensitive
            if(!this.touch.endX || Math.abs(this.touch.endX - this.touch.startX) < 20) {
                return;
            }

            if(this.touch.endX < this.touch.startX) {
                this.goToNext();
            }
            else {
                this.goToPrev();
            }
        }
    }
});
</script>

<template>
    <div class="slider-list">
        currentIndex {{ currentIndex }}
        <div class="relative">
            <ul :style="listLength">
                <li
                    v-for="(obj, index) in pics"
                    :key="index"
                    :style="listPosition">
                    <div class="slide">
                        <img :src="obj.url" />
                        <!-- <nuxt-image
                            :placeholder="true"
                            :src="obj.url" /> -->
                    </div>
                </li>
            </ul>

            <!-- previous button -->
            <button
                ref="prevButton"
                class="slider-nav-btn slider-nav-btn-prev"
                :disabled="!canGoToPrev"
                type="button"
                @click="goToPrev()">
                <fig-icon icon="chevron-left" width="24" height="24" />
            </button>

            <!-- next button -->
            <button
                ref="nextButton"
                class="slider-nav-btn slider-nav-btn-next"
                :disabled="!canGoToNext"
                type="button"
                @click="goToNext()">
                <fig-icon icon="chevron-right" width="24" height="24" />
            </button>
        </div>

        <div class="flex justify-between">
            <!-- dots -->
            <ul
                ref="dots"
                class="slider-nav-dots">
                <li
                    v-for="n in countSlides"
                    :key="n"
                    class="slider-nav-dot"
                    :class="{'slider-nav-dot-current': n - 1 === currentIndex}">
                    <button
                        type="button"
                        @click="goTo(n - 1)">
                        {{ n }}
                    </button>
                </li>
            </ul>
        </div>
    </div>
</template>

<style scoped>
.slider-list {
    @apply relative;
}

.slider-list ul {
    @apply list-none flex;
}
.slider-list ul li {
    @apply p-2;
    transition: all .5s ease;
}

.slide {
    @apply relative w-full bg-gray-350 overflow-hidden;
}
.slide img {
    @apply w-full bg-center bg-cover;
}

.slider-nav-btn {
    @apply border-0 cursor-pointer h-full absolute top-0 flex items-center justify-center;
    background: none;
    width: 90px;
}
.slider-nav-btn:hover {
    background: rgba(255,255,255,0.2);
}
.slider-nav-btn[disabled]{
    @apply cursor-not-allowed;
}
.slider-nav-btn[disabled]:hover {
    background: none;
}
.slider-nav-btn[disabled] svg {
    stroke: rgb(159, 159, 159) !important;
}
.slider-nav-btn-prev {
    @apply left-0;
}
.slider-nav-btn-next {
    @apply right-0;
}

.slider-nav-dots {
    @apply flex items-center list-none whitespace-no-wrap relative p-0 pt-2 m-0;
    left: 50%;
    transform: translateX(-50%);
}

.slider-nav-dot {
    @apply mx-1 my-0;
}
.slider-nav-dot button {
    @apply bg-transparent border border-gray-300 rounded-full cursor-pointer block m-0 p-0;
    height: 10px;
    width: 10px;
    font-size: 0;
    line-height: 0;
    transition-duration: .3s;
}
.slider-nav-dot button:hover,
.slider-nav-dot-current button {
    @apply bg-gray-300;
}
</style>

