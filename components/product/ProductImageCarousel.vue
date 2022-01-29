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
            isSSR: (typeof window === 'undefined'),
            transitionDelay: 0,
            translateX: 0,
            widthWindow: 0,
            widthContainer: 0,
            widthSlide: 'auto',
            fullscreen: {
                show: false,
                src: null
            }
        };
    },

    computed: {
        breakpoints: function () {
            return (!this.initialSettings.responsive) ? [] : this.initialSettings.responsive.map(item => item.breakpoint);
        },

        canGoToPrev: function () {
            return this.currentSlide > 0;
        },

        canGoToNext: function () {
            return this.currentSlide < this.countSlides - 1;
        },

        countSlides: function () {
            return (this.isSSR) ? this.htmlCollectionToArray(this.$slots.default).length : this.slides.length;
        },

        currentBreakpoint: function () {
            const breakpoints = this.breakpoints.map(item => item).reverse();
            return (this.initialSettings.mobileFirst) ? breakpoints.find(item => item < this.widthWindow) || 0 : breakpoints.find(item => item > this.widthWindow) || null;
        },

        marginX: function () {
            if (this.settings.unagile) {
                return 0;
            }

            const marginX = 0;
            return (this.settings.rtl) ? marginX : -1 * marginX;
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
            const widthStyle = `${this.widthSlide}${(this.widthSlide !== 'auto') ? 'px' : ''}`;

            for (let i=0, l=this.slides.length; i<l; i++) {
                this.slides[i].style.width = widthStyle;
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

        // Commenting out becase I only want touch swiping, not mouse swiping:
        // this.$refs.track.addEventListener('mousedown', this.handleMouseDown);
        // this.$refs.track.addEventListener('mouseup', this.handleMouseUp);
        // this.$refs.track.addEventListener('mousemove', this.handleMouseMove);

        // Init
        this.isSSR = false;
        this.reload();
    },

    beforeDestroy () {
        window.removeEventListener('resize', this.getWidth);

        this.$refs.track.removeEventListener('touchstart', this.handleMouseDown);
        this.$refs.track.removeEventListener('touchend', this.handleMouseUp);
        this.$refs.track.removeEventListener('touchmove', this.handleMouseMove);
        // this.$refs.track.removeEventListener('mousedown', this.handleMouseDown);
        // this.$refs.track.removeEventListener('mouseup', this.handleMouseUp);
        // this.$refs.track.removeEventListener('mousemove', this.handleMouseMove);

        // this.disableAutoPlay();
    },

    methods: {
        getWidth () {
            if (this.isSSR) {
                return false;
            }

            this.widthWindow = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
            this.widthContainer = this.$refs.list.clientWidth;
            this.widthSlide = (!this.settings.unagile) ? this.widthContainer : 'auto';
        },

        /**
        * Convert HTML Collection to JS Array
        */
        htmlCollectionToArray (collection) {
            return Array.prototype.slice.call(collection, 0);
        },

        getCurrentBreakpoint () {
            return this.currentBreakpoint;
        },

        // Return settings for current breakpoint
        getCurrentSettings () {
            return this.settings;
        },

        getCurrentSlide () {
            return this.currentSlide;
        },

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
                if (n >= this.countSlides) {
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

            if (this.currentSlide + 1 <= this.countSlides) {
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

        reload () {
            console.log("RELOAD")
            this.getWidth();
            this.prepareSlides();
            this.prepareCarousel();
            this.toggleFade();
        },

        handleMouseDown (e) {
            this.isMouseDown = true;

            if (e.type.indexOf('touch') !== -1) {
                this.dragStartX = e.touches[0].clientX;
                this.dragStartY = e.touches[0].clientY;
            }
            // if (e.type.indexOf('mouse') !== -1) {
            //     this.dragStartX = e.clientX;
            //     this.dragStartY = e.clientY;
            // }
        },

        handleMouseMove (e) {
            let positionX;
            let positionY;

            if (e.type.indexOf('touch') !== -1) {
                positionX = e.touches[0].clientX;
                positionY = e.touches[0].clientY;
            }
            // if (e.type.indexOf('mouse') !== -1) {
            //     positionX = e.clientX;
            //     positionY = e.clientY;
            // }

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

        /**
         * Prepare slides classes and styles
         */
        prepareSlides () {
            this.slides = this.htmlCollectionToArray(this.$refs.slides.children);

            const widthStyle = `${this.widthSlide}${(this.widthSlide !== 'auto') ? 'px' : ''}`;

            for (const slide of this.slides) {
                slide.classList.add('agile__slide');
                slide.style.width = widthStyle;
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

            const start = this.currentSlide;

            // To account for the combination of infinite = false and centerMode = true, ensure we don't overrun the bounds of the slide count.
            for (let i = Math.max(start, 0); i < Math.min(start + 1, this.countSlides); i++) {
                this.slides[i].classList.add('agile__slide--current');
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
        },

        onSlidesClick(e) {
            console.log("ON SLIDES CLICK", e)
            console.log("TARGET", e.target.dataset.piio)
            this.fullscreen.src = e.target.dataset.piio;
            this.fullscreen.show = true;
        },

        onFullCloseClick() {
            this.fullscreen.show = false;
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
                :style="{transform: `translate(${translateX + marginX}px)`, transition: `transform ${settings.timing} ${transitionDelay}ms`}">

                <div
                    ref="slides"
                    class="agile__slides agile__slides--regular"
                    @click="onSlidesClick">
                    <slot></slot>
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

            <ul
                ref="dots"
                class="agile__dots">
                <li
                    v-for="n in countSlides"
                    :key="n"
                    class="agile__dot"
                    :class="{'agile__dot--current': n - 1 === currentSlide}">
                    <button
                        type="button"
                        @click="goTo(n - 1)">
                        {{ n }}
                    </button>
                </li>
            </ul>

        </div>

        <div class="agile_full" v-if="fullscreen.show">
            <img :src="fullscreen.src" v-image-drag:center>
            <button
                type="button"
                class="agile_full_close"
                :aria-label="$t('Close')"
                @click="onFullCloseClick">
                <fig-icon icon="x" width="24" height="24" />
            </button>
        </div>

    </div>
</template>


<style lang="scss">
.agile:focus,
.agile:active,
.agile *:focus,
.agile *:active {
    outline: none;
}

.agile {
    position: relative;
    overflow: hidden;

    .agile--ssr {
        .agile__slides--cloned {
            display: none
        }

        .agile__slides > * {
            overflow: hidden;
            width: 0
        }

        .agile__slides > *:first-child {
            width: 100%
        }
    }

    .agile--rtl {
        .agile__track,
        .agile__slides,
        .agile__actions,
        .agile__dots {
            flex-direction: row-reverse;
        }
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
        @apply flex justify-center items-center grow shrink-0 overflow-hidden;
    }

    .agile__slide,
    .agile__slide * {
        -webkit-user-drag: none;
    }

    .agile--fade {
        .agile__slide {
            opacity: 0;
            position: relative;
            z-index: 0;
        }

        .agile__slide--active {
            opacity: 1;
            z-index: 2;
        }

        .agile__slide--expiring {
            opacity: 1;
            transition-duration: 0s;
            z-index: 1;
        }
    }

    .agile__actions {
        display: flex;
        justify-content: space-between;

        .agile__nav-button {
            @apply flex justify-center items-center absolute h-full cursor-pointer border-0 bg-none top-0;
            width: 90px;

            &:hover {
                background: rgba(255,255,255,0.2);
            }

            // &:focus {
            //     border: 2px solid green;
            //     box-shadow: none;
            // }

            &[disabled] {
                cursor: not-allowed;

                &:hover {
                    background: none;
                }

                svg {
                    stroke: rgb(159, 159, 159) !important;
                }
            }

            &.agile__nav-button--prev {
                left: 0;

                svg {
                    margin-left: -2px;
                }
            }

            &.agile__nav-button--next {
                right: 0;

                svg {
                    margin-right: -2px;
                }
            }

            &.agile__nav-button--prev,
            &.agile__nav-button--next {
                div {
                    height: 40px;
                    width: 40px;
                    background-color: rgba(255, 255, 255, 0.2);
                    border-radius: 20px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    text-align: center;

                    svg {
                        stroke: #000;
                    }

                    &:hover {
                        background-color: rgba(255, 255, 255, 0.8);
                    }
                }
            }
        }

        .agile__dots {
            align-items: center;
            display: flex;
            list-style: none;
            padding: 10px 0 0;
            white-space: nowrap;
            // bottom: -15px;
            left: 50%;
            position: relative;
            transform: translateX(-50%);

            .agile__dot {
                margin: 0 10px;

                button {
                    background-color: transparent;
                    border: 1px solid #a8a8a8;
                    border-radius: 50%;
                    cursor: pointer;
                    display: block;
                    height: 10px;
                    font-size: 0;
                    line-height: 0;
                    margin: 0;
                    padding: 0;
                    transition-duration: .3s;
                    width: 10px;
                }

                &.agile__dot--current,
                &:hover {
                    button {
                        background-color: #a8a8a8;
                    }
                }
            }
        }
    }

    .agile_full {
        position: fixed;
        top: 0px;
        bottom: 0px;
        left: 0px;
        right: 0px;
        overflow: hidden;
        background-color: rgb(255, 255, 255);
        z-index: 10;

        .agile_full_close {
            border: 0;
            background: none;
            position: fixed;
            top: 20px;
            right: 20px;
            cursor: pointer;
        }

        img {
            position: absolute;
            max-width: initial;
            top: 0;
            left: 0;
            transition: opacity 100ms ease-in-out 0s;
            opacity: 1;
        }
    }

    @media only screen and (min-width : 641px) {
        .agile_full {
            .agile_full_close {
                top: 40px;
                right: 40px;
            }
        }
    }
}

.agile--disabled {
    .agile__slides {
        display: block;
        width: 100%;

        .slide {
            width: 100%;

            img {
                width: 100%;
            }
        }
    }

    @media only screen and (min-width: 1024px) {
        .agile__slides {
            @apply flex flex-wrap justify-between items-start;
            padding: 10px 0 0 10px;

            .slide {
                @apply flex-none;
                width: 50% !important;
                padding: 0 10px 10px 0;
            }
        }
    }
}
</style>
