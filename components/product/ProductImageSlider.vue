<script>
/*
* This component was heavily inspired by watching this video:
* https://www.youtube.com/watch?v=vk69GJUM3Mc
*/

import Vue from 'vue';
import VueHotkey from 'v-hotkey';
import throttle from 'lodash.throttle';
import product_mixin from '@/mixins/product_mixin';
import { getAllProductVariantImagesAtWidth } from '@/utils/product';

Vue.use(VueHotkey);

export default Vue.extend({
    props: {
        product: {
            type: Object,
            default: () => {
                return {};
            }
        },

        variantId: {
            type: String,
            default: null
        },

        slideshowDisabledWidth: {
            type: Number,
            default: 1024
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
            widthWindow: 0,
            touch: {
                startX: 0,
                endX: 0
            },
            fullscreen: {
                show: false,
                pics: []
            },
            pics: []
        };
    },

    computed: {
        slideUlStyle() {
            return !this.slideshowDisabled
                ? { width: this.countSlides * 100 + '%' }
                : { display: 'flex', 'flex-wrap': 'wrap', 'justify-content': 'space-between', 'align-items': 'flex-start' };
        },

        slideLiStyle() {
            return !this.slideshowDisabled
                ? { transform: 'translateX(-' + (this.currentIndex * 100) + '%)', width: this.countSlides * 100 + '%' }
                : { width: '50%', display: 'flex' };
        },

        countSlides() {
            return this.pics.length;
        },

        canGoToPrev () {
            return !this.slideshowDisabled && this.currentIndex > 0;
        },

        canGoToNext() {
            return !this.slideshowDisabled && this.currentIndex < this.countSlides - 1;
        },

        slideshowDisabled() {
            return this.widthWindow > this.slideshowDisabledWidth;
        }
    },

    watch: {
        variantId: {
            handler: function(newVal) {
                if(newVal) {
                    // BUG WORKAROUND:
                    // Wrapping the setting of pics and fullscreen.pics with nextTick
                    // to work around a bug in @nuxt/image:
                    // https://github.com/nuxt/image/issues/114
                    this.pics = [];
                    this.fullscreen.pics = [];

                    const self = this;

                    Vue.nextTick(function () {
                        self.pics = self.getPicsForWidth(600, self.variantId);
                        self.fullscreen.pics = self.getPicsForWidth(1200, self.variantId);
                    });
                }
            },
            immediate: true
        }
    },

    created () {
        this.goTo = throttle(this.goTo, this.throttleDelay);
        this.getWidth = throttle(this.getWidth, 500);

        this.getWidth();
    },

    mounted() {
        this.$el.addEventListener('touchstart', (event) => this.onTouchStart(event));
        this.$el.addEventListener('touchmove', (event) => this.onTouchMove(event));
        this.$el.addEventListener('touchend', (event) => this.onTouchEnd(event));

        window.addEventListener('resize', this.getWidth);
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
        },

        onSlidesClick(e) {
            // Only display full screen on desktop.
            // Pics are already full screen in mobile devices.
            if(this.slideshowDisabled) {
                this.fullscreen.show = true;
                document.body.style.overflow = 'hidden';
            }
        },

        onFullScreenCloseClick() {
            this.fullscreen.show = false;
            document.body.style.overflow = '';
        },

        getWidth() {
            this.widthWindow = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        },

        getPicsForWidth(width, variantId) {
            let images = [];

            if(!Array.isArray(this.product.variants) || !this.product.variants.length) {
                return images;
            }

            this.product.variants.forEach((variant) => {
                if(variant.id === variantId) {
                    const variantImages = getAllProductVariantImagesAtWidth(variant, width);
                    if(variantImages.length) {
                        images = images.concat(variantImages);
                    }
                }
            });

            return images;
        }
    }
});
</script>

<template>
    <div
        class="slider-list"
        :class="{'slider-disabled': slideshowDisabled}">
        <ul
            :style="slideUlStyle"
            class="w-full"
            @click="onSlidesClick">
            <li
                v-for="(obj, index) in pics"
                :key="index"
                :style="slideLiStyle">
                <div class="relative w-full bg-gray-350 overflow-hidden">
                    <nuxt-image
                        :placeholder="true"
                        :src="obj.url"
                        :lazy="true" />
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
            <div class="icon">
                <fig-icon
                    icon="chevron-left"
                    :width="24"
                    :height="24"
                    stroke-color="#000" />
            </div>
        </button>

        <!-- next button -->
        <button
            ref="nextButton"
            class="slider-nav-btn slider-nav-btn-next"
            :disabled="!canGoToNext"
            type="button"
            @click="goToNext()">
            <div class="icon">
                <fig-icon icon="chevron-right" width="24" height="24" />
            </div>
        </button>

        <!-- dots -->
        <div class="slider-nav-dots-container">
            <div class="flex justify-between">
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
                            @click="goTo(n - 1)"></button>
                    </li>
                </ul>
            </div>
        </div>

        <!-- full screen -->
        <div
            class="slider-fullscreen"
            v-if="fullscreen.show"
            v-hotkey="{'esc': onFullScreenCloseClick}">

            <div
                v-for="(obj, index) in fullscreen.pics"
                :key="index"
                class="mb-2">
                <nuxt-image
                    :placeholder="true"
                    :src="obj.url" />
            </div>

            <button
                type="button"
                class="slider-fullscreen-close"
                :aria-label="$t('Close')"
                @click="onFullScreenCloseClick">
                <fig-icon icon="x" width="24" height="24" />
            </button>
        </div>

    </div>
</template>

<style scoped>
.slider-list {
    @apply relative;
}
.slider-list > ul {
    @apply list-none flex;
}
.slider-list > ul li {
    @apply p-1;
    transition: all .5s ease;
}

.slider-nav-btn {
    @apply border-0 cursor-pointer h-full absolute top-0 flex items-center justify-center;
    background: none;
    width: 90px;
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
.slider-nav-btn-prev svg {
    margin-left: -2px;
}
.slider-nav-btn-next {
    @apply right-0;
}
.slider-nav-btn-next svg {
    margin-right: -2px;
}
.slider-nav-btn .icon {
    @apply rounded-full flex items-center justify-center;
    background: rgba(255,255,255,.8);
    height: 40px;
    width: 40px;
}

.slider-nav-dots-container {
    @apply absolute bottom-0 w-full pb-2;
}
.slider-nav-dots {
    @apply flex items-center list-none whitespace-no-wrap relative p-0 py-2 m-0;
    left: 50%;
    transform: translateX(-50%);
}
.slider-nav-dot {
    @apply mx-2 my-0;
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

.slider-disabled {
    @apply flex flex-wrap justify-between items-start p-0 pt-2 pl-2;
}
.slider-disabled > ul li {
    @apply cursor-pointer;
}
.slider-disabled .slider-nav-dots-container,
.slider-disabled .slider-nav-btn {
    @apply hidden;
}

.slider-fullscreen {
    @apply fixed inset-0 z-10 bg-white overflow-y-scroll;
}
.slider-fullscreen-close {
    @apply border-0 fixed cursor-pointer p-5 rounded-md;
    background: rgba(255,255,255,.7);
    top: 10px;
    right: 25px;
}
.slider-fullscreen img {
    @apply w-full;
    max-width: initial;
}
</style>

