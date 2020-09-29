<script>
import orderBy from 'lodash.orderby';
import throttle from 'lodash.throttle';

export default {
    name: 'ProductImageCarousel',

    props: {

        /**
         * Slide change delay in milliseconds
         */
        changeDelay: {
            type: Number,
            default: 0
        },

        /**
         * Enable fade effect
         */
        fade: {
            type: Boolean,
            default: false
        },

        /**
         * Infinite loop sliding
         */
        infinite: {
            type: Boolean,
            default: true
        },

        /**
         * Index of slide to start on
         */
        initialSlide: {
            type: Number,
            default: 0
        },

        /**
         * Enable mobile first calculation for responsive settings
         */
        mobileFirst: {
            type: Boolean,
            default: true
        },

        /**
         * All settings as one object
         */
        options: {
            type: Object,
            default: () => null
        },

        /**
         * Object containing breakpoints and settings objects
         */
        responsive: {
            type: Array,
            default: () => null
        },

        /**
         * Enable right-to-left mode
         */
        rtl: {
            type: Boolean,
            default: false
        },

        /**
         * Slide animation speed in milliseconds
         */
        speed: {
            type: Number,
            default: 300
        },

        /**
         * Swipe distance
         */
        swipeDistance: {
            type: Number,
            default: 50
        },

        /**
         * Throttle delay in milliseconds
         */
        throttleDelay: {
            type: Number,
            default: 500
        },

        /**
         * Transition timing function
         * Available: ease, linear, ease-in, ease-out, ease-in-out
         */
        timing: {
            type: String,
            default: 'ease',
            validator: (value) => {
                return ['ease', 'linear', 'ease-in', 'ease-out', 'ease-in-out'].indexOf(value) !== -1;
            }
        },

        /**
         * Disable Agile carousel
         */
        unagile: {
            type: Boolean,
            default: false
        }
    },


    data () {
        return {
            currentSlide: null,
            dragDistance: 0,
            dragStartX: 0,
            dragStartY: 0,
            isMouseDown: false,
            slides: [],
            slidesClonedAfter: [],
            slidesClonedBefore: [],
            isSSR: (typeof window === 'undefined'),
            transitionDelay: 0,
            translateX: 0,
            widthWindow: 0,
            widthContainer: 0
        };
    },

    computed: {
        breakpoints: function () {
            return (!this.initialSettings.responsive) ? [] : this.initialSettings.responsive.map(item => item.breakpoint);
        },

        canGoToPrev: function () {
            return (this.settings.infinite || this.currentSlide > 0);
        },

        canGoToNext: function () {
            return (this.settings.infinite || this.currentSlide < this.countSlides - 1);
        },

        countSlides: function () {
            return (this.isSSR) ? this.htmlCollectionToArray(this.$slots.default).length : this.slides.length;
        },

        countSlidesAll: function () {
            return this.slidesAll.length;
        },

        currentBreakpoint: function () {
            const breakpoints = this.breakpoints.map(item => item).reverse();
            return (this.initialSettings.mobileFirst) ? breakpoints.find(item => item < this.widthWindow) || 0 : breakpoints.find(item => item > this.widthWindow) || null;
        },

        marginX: function () {
            if (this.settings.unagile) {
                return 0;
            }

            const marginX = (this.slidesCloned) ? this.countSlides * this.widthSlide : 0;
            return (this.settings.rtl) ? marginX : -1 * marginX;
        },

        slidesCloned: function () {
            return (!this.settings.unagile && !this.settings.fade && this.settings.infinite);
        },

        slidesAll: function () {
            return (this.slidesCloned) ? [...this.slidesClonedBefore, ...this.slides, ...this.slidesClonedAfter] : this.slides;
        },

        widthSlide: function () {
            return (!this.settings.unagile) ? this.widthContainer : 'auto';
        },

        // Initial settings based on props and options object
        initialSettings: function () {
            // options prop is excluded
            let { options, ...initialSettings } = this.$props;

            // Join settings from options
            if (options) {
                initialSettings = {...initialSettings, ...options};
            }

            // Sort breakpoints
            if (initialSettings.responsive) {
                initialSettings.responsive = orderBy(initialSettings.responsive, 'breakpoint');
            }

            return initialSettings;
        },

        // Settings for current breakpoint
        settings: function () {
            const { responsive, ...settings } = this.initialSettings;

            if (responsive) {
                responsive.forEach(option => {
                    if (settings.mobileFirst ? option.breakpoint < this.widthWindow : option.breakpoint > this.widthWindow) {
                        for (let key in option.settings) {
                            settings[key] = option.settings[key];
                        }
                    }
                });
            }

            return settings;
        }
    },

    watch: {
        currentBreakpoint () {
            this.$emit('breakpoint', { breakpoint: this.currentBreakpoint });
        },

        currentSlide () {
            this.prepareSlidesClasses();
            this.$emit('after-change', { currentSlide: this.currentSlide });
        },

        dragDistance () {
            if (this.isMouseDown) {
                const { rtl } = this.settings;
                const dragDistance = this.dragDistance * (rtl ? -1 : 1);

                if (dragDistance > this.swipeDistance && this.canGoToPrev) {
                    this.goToPrev();
                    this.handleMouseUp();
                }

                if (dragDistance < -1 * this.swipeDistance && this.canGoToNext) {
                    this.goToNext();
                    this.handleMouseUp();
                }
            }
        },

        'settings.fade' () {
            this.toggleFade();
        },

        widthSlide () {
            for (let i = 0; i < this.countSlidesAll; i++) {
                this.slidesAll[i].style.width = `${this.widthSlide}${(this.widthSlide !== 'auto') ? 'px' : ''}`;
            }
        },

        widthWindow (newValue, oldValue) {
            if (oldValue) {
                this.prepareCarousel();
                this.toggleFade();
            }
        }
    },

    created () {
        this.goTo = throttle(this.goTo, this.throttleDelay);
        this.getWidth = throttle(this.getWidth, 500);
    },

    mounted () {
        // Windows resize listener
        window.addEventListener('resize', this.getWidth);

        // Mouse and touch events
        this.$refs.track.addEventListener('touchstart', this.handleMouseDown);
        this.$refs.track.addEventListener('touchend', this.handleMouseUp);
        this.$refs.track.addEventListener('touchmove', this.handleMouseMove);
        this.$refs.track.addEventListener('mousedown', this.handleMouseDown);
        this.$refs.track.addEventListener('mouseup', this.handleMouseUp);
        this.$refs.track.addEventListener('mousemove', this.handleMouseMove);

        // Init
        this.isSSR = false;
        this.reload();
    },

    beforeDestroy () {
        window.removeEventListener('resize', this.getWidth);

        this.$refs.track.removeEventListener('touchstart', this.handleMouseDown);
        this.$refs.track.removeEventListener('touchend', this.handleMouseUp);
        this.$refs.track.removeEventListener('touchmove', this.handleMouseMove);
        this.$refs.track.removeEventListener('mousedown', this.handleMouseDown);
        this.$refs.track.removeEventListener('mouseup', this.handleMouseUp);
        this.$refs.track.removeEventListener('mousemove', this.handleMouseMove);

        // this.disableAutoPlay();
    },

    methods: {

        /**
        * Set window & container width
        */
        getWidth () {
            if (this.isSSR) {
                return false;
            }

            this.widthWindow = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
            this.widthContainer = this.$refs.list.clientWidth;
        },

        /**
        * Convert HTML Collection to JS Array
        */
        htmlCollectionToArray (collection) {
            return Array.prototype.slice.call(collection, 0);
        },

        // Return current breakpoint
        getCurrentBreakpoint () {
            return this.currentBreakpoint;
        },

        // Return settings for current breakpoint
        getCurrentSettings () {
            return this.settings;
        },

        // Return current slide index
        getCurrentSlide () {
            return this.currentSlide;
        },

        // Return initial settings
        getInitialSettings () {
            return this.initialSettings;
        },

        disableScroll () {
            document.ontouchmove = (e) => e.preventDefault();
        },

        enableScroll () {
            document.ontouchmove = () => true;
        },

        toggleFade () {
            const enabled = (!this.settings.unagile && this.settings.fade);

            for (let i = 0; i < this.countSlides; i++) {
                this.slides[i].style.transition = (enabled) ? 'opacity ' + this.settings.timing + ' ' + this.settings.speed + 'ms' : 'none';
                this.slides[i].style.transform = (enabled) ? `translate(-${i * this.widthSlide}px)` : 'none';
            }
        },

        // Go to slide
        goTo (n, transition = true) {
            // Break goTo() if unagile is active
            if (this.settings.unagile) {
                return false;
            }

            let slideNextReal = n;

            if (transition) {
                if (this.settings.infinite && n < 0) {
                    slideNextReal = this.countSlides - 1;
                }
                else if (n >= this.countSlides) {
                    slideNextReal = 0;
                }

                this.$emit('before-change', { currentSlide: this.currentSlide, nextSlide: slideNextReal });

                this.currentSlide = slideNextReal;

                if (n !== slideNextReal) {
                    setTimeout(() => {
                        this.goTo(slideNextReal, false);
                    }, this.settings.speed);
                }
            }

            const translateX = (!this.settings.fade) ? n * this.widthSlide : 0;
            this.transitionDelay = (transition) ? this.speed : 0;

            if (this.infinite || (this.currentSlide + 1 <= this.countSlides)) {
                this.translateX = (this.settings.rtl) ? translateX : -1 * translateX;
            }
        },

        // Go to next slide
        goToNext () {
            if (this.canGoToNext) {
                this.goTo(this.currentSlide + 1);
            }
        },

        // Go to previous slide
        goToPrev () {
            if (this.canGoToPrev) {
                this.goTo(this.currentSlide - 1);
            }
        },

        // Reload carousel
        reload () {
            this.getWidth();
            this.prepareSlides();
            this.prepareCarousel();
            this.toggleFade();
            // this.toggleAutoPlay();
        },

        handleMouseDown (e) {
            this.isMouseDown = true;

            if (e.type.indexOf('touch') !== -1) {
                this.dragStartX = e.touches[0].clientX;
                this.dragStartY = e.touches[0].clientY;
            }
            if (e.type.indexOf('mouse') !== -1) {
                this.dragStartX = e.clientX;
                this.dragStartY = e.clientY;
            }
        },

        handleMouseMove (e) {
            let positionX;
            let positionY;
            if (e.type.indexOf('touch') !== -1) {
                positionX = e.touches[0].clientX;
                positionY = e.touches[0].clientY;
            }
            if (e.type.indexOf('mouse') !== -1) {
                positionX = e.clientX;
                positionY = e.clientY;
            }
            const dragDistanceX = Math.abs(positionX - this.dragStartX);
            const dragDistanceY = Math.abs(positionY - this.dragStartY);
            if (dragDistanceX > 3 * dragDistanceY) {
                this.disableScroll();
                this.dragDistance = positionX - this.dragStartX;
            }
        },

        handleMouseUp () {
            this.isMouseDown = false;
            this.enableScroll();
        },

        handleMouseOver (element) {
        },

        handleMouseOut (element) {
        },

        /**
         * Prepare slides classes and styles
         */
        prepareSlides () {
            this.slides = this.htmlCollectionToArray(this.$refs.slides.children);

            // Probably timeout needed
            if (this.slidesCloned) {
                this.slidesClonedBefore = this.htmlCollectionToArray(this.$refs.slidesClonedBefore.children);
                this.slidesClonedAfter = this.htmlCollectionToArray(this.$refs.slidesClonedAfter.children);
            }

            for (const slide of this.slidesAll) {
                slide.classList.add('agile__slide');
            }
        },

        /**
         *  Prepare slides active/current classes
         */
        prepareSlidesClasses () {
            if (this.currentSlide === null) {
                return false;
            }

            // Remove active & current classes
            for (let i = 0; i < this.countSlides; i++) {
                this.slides[i].classList.remove('agile__slide--active');
                this.slides[i].classList.remove('agile__slide--current');
            }

            // Add active & current class for current slide
            setTimeout(() => this.slides[this.currentSlide].classList.add('agile__slide--active'), this.changeDelay);

            const start = (this.slidesCloned) ? this.countSlides + this.currentSlide : this.currentSlide;

            // To account for the combination of infinite = false and centerMode = true, ensure we don't overrun the bounds of the slide count.
            for (let i = Math.max(start, 0); i < Math.min(start + 1, this.countSlides); i++) {
                this.slidesAll[i].classList.add('agile__slide--current');
            }
        },

        /**
         * Prepare carousel styles
         */
        prepareCarousel () {
            // Prepare track
            if (this.settings.unagile) {
                this.translateX = 0;
            }
            else {
                if (this.currentSlide === null && this.countSlides) {
                    this.currentSlide = this.settings.initialSlide;
                }

                if (this.currentSlide > this.countSlides) {
                    this.currentSlide = this.countSlides - 1;
                }

                this.goTo(this.currentSlide);
            }
        }
    }
};
</script>

<template>
    <div
        class="agile"
        :class="{'agile--ssr': isSSR, 'agile--disabled': settings.unagile, 'agile--fade': settings.fade && !settings.unagile, 'agile--rtl': settings.rtl}"
        @touchstart="() => {}">
        <div
            ref="list"
            class="agile__list">
            <div
                ref="track"
                class="agile__track"
                :style="{transform: `translate(${translateX + marginX}px)`, transition: `transform ${settings.timing} ${transitionDelay}ms`}"
                @mouseover="handleMouseOver('track')"
                @mouseout="handleMouseOut('track')">
                <div
                    v-show="slidesCloned"
                    ref="slidesClonedBefore"
                    class="agile__slides agile__slides--cloned">
                    <slot />
                </div>

                <div
                    ref="slides"
                    class="agile__slides agile__slides--regular">
                    <slot />
                </div>

                <div
                    v-show="slidesCloned"
                    ref="slidesClonedAfter"
                    class="agile__slides agile__slides--cloned">
                    <slot />
                </div>
            </div>
        </div>


        <div
            v-if="$slots.caption"
            class="agile__caption">
            <slot name="caption" />
        </div>

        <div
            v-if="!settings.unagile"
            class="agile__actions">
            <button
                ref="prevButton"
                class="agile__nav-button agile__nav-button--prev"
                :disabled="!canGoToPrev"
                type="button"
                @click="goToPrev()">
                <slot name="prevButton">
                    ←
                </slot>
            </button>

            <ul
                ref="dots"
                class="agile__dots">
                <li
                    v-for="n in countSlides"
                    :key="n"
                    class="agile__dot"
                    :class="{'agile__dot--current': n - 1 === currentSlide}"
                    @mouseover="handleMouseOver('dot')"
                    @mouseout="handleMouseOut('dot')">
                    <button
                        type="button"
                        @click="goTo(n - 1)">
                        {{ n }}
                    </button>
                </li>
            </ul>

            <button
                ref="nextButton"
                class="agile__nav-button agile__nav-button--next"
                :disabled="!canGoToNext"
                type="button"
                @click="goToNext()">
                <slot name="nextButton">
                    →
                </slot>
            </button>
        </div>
    </div>
</template>


<style>
.agile {
    position: relative;
}

.agile--ssr .agile__slides--cloned {
    display: none
}

.agile--ssr .agile__slides > * {
    overflow: hidden;
    width: 0
}

.agile--ssr .agile__slides > *:first-child {
    width: 100%
}

.agile--rtl .agile__track,
.agile--rtl .agile__slides,
.agile--rtl .agile__actions,
.agile--rtl .agile__dots {
    flex-direction: row-reverse;
}

.agile:focus, .agile:active, .agile *:focus, .agile *:active {
    outline: none;
}

.agile__list {
    display: block;
    overflow: hidden;
    position: relative;
    width: 100%;
}

.agile__track {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
}

.agile__actions {
    display: flex;
    justify-content: space-between;
}

.agile__slides {
    align-items: center;
    display: flex;
    flex-direction: row;
    flex-grow: 1;
    flex-shrink: unset;
    flex-wrap: nowrap;
    justify-content: flex-start;
}

.agile--disabled .agile__slides {
    display: block;
    width: 100%;
}

.agile__slide {
    display: block;
    flex-grow: 1;
    flex-shrink: 0;
}

.agile__slide,
.agile__slide * {
    -webkit-user-drag: none;
}

.agile--fade .agile__slide {
    opacity: 0;
    position: relative;
    z-index: 0;
}

.agile--fade .agile__slide--active {
    opacity: 1;
    z-index: 2;
}

.agile--fade .agile__slide--expiring {
    opacity: 1;
    transition-duration: 0s;
    z-index: 1;
}

.agile__nav-button[disabled] {
    cursor: default;
}

.agile__dots {
    align-items: center;
    display: flex;
    list-style: none;
    padding: 0;
    white-space: nowrap;
}

.agile__dot button {
    cursor: pointer;
    display: block;
    font-size: 0;
    line-height: 0;
}
</style>
