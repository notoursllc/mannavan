<script>
import IconLogo from '@/components/icons/IconLogo'

export default {
    components: {
        IconLogo
    },

    methods: {
        imageStyle(img) {
            return `background-image:url(${img})`;
        }
    },

    created() {
        this.$store.dispatch('ui/pageTitle', null);
    }
}
</script>


<template>
    <div class="widthAll">
        <div class="top-panel">
            <div class="top-panel-item logo">
                <i><icon-logo icon-name="breadvan" class-name="fillGrayLight" width="100%" /></i>
            </div>
            <div class="top-panel-item flex-grow">
                <div class="intro">INTRODUCING BREADVAN<span class="tm">&trade;</span></div>
                <div class="subhead">
                    <div>Breadvan is a startup apparel company.</div>
                    <div>We're inspired by the timeless styles and colors of the good 'ol days of auto racing.</div>
                    <div class="colorGreen">Yep, we only have 2 products right now!  More coming soon!</div>
                </div>
            </div>
        </div>

        <section class="featured-container">
            <nuxt-link
                :to="{ name: 'type-name-seouri', params: { name:'tops', seouri:'seo_uri_5'} }"
                tag="div"
                class="featured-item cursorPointer grow">
                <img src="https://gmnst-assets.nyc3.digitaloceanspaces.com/development/uploads/images/sample-300-x-400.png" />
            </nuxt-link>

            <nuxt-link
                :to="{ name: 'type-name-seouri', params: { name:'tops', seouri:'seo_uri_5'} }"
                tag="div"
                class="featured-item cursorPointer grow">
                <img src="https://gmnst-assets.nyc3.digitaloceanspaces.com/development/uploads/images/sample_calbeamin.jpg" />
            </nuxt-link>
        </section>
    </div>
</template>


<style lang="scss" scoped>
    @import "~assets/css/components/_variables.scss";
    @import "~assets/css/components/_mixins.scss";

    .top-panel {
        @include flexbox();
        @include flex-direction(row);
        @include justify-content(center);
        @include align-items(center);
        @include flex-wrap(nowrap);
        background: linear-gradient(0deg, #1b1b1b 10%, #424242 100%) no-repeat scroll center center/cover;
        padding: 10px;

      .intro {
            color: #88898a;
            font-size: 14px;
            font-weight: 600;

            .tm {
                font-size: 12px;
                font-weight: 400;
                margin-left: 2px;
                position: relative;
                top: -2px;
            }
        }

        .subhead {
            color:rgba(255,255,255,.8);
            font-size: 18px;
        }

        .top-panel-item {
            @include align-items(center);
            @include justify-content(center);
            @include flex-basis(auto);
            // border: 1px solid red;

            &.logo {
                margin: 0 40px 0 0;
                width: 130px;
                // border: 1px solid red;
            }
            .flex-grow {
                @include flex-grow(1);
            }
        }
    }

    .featured-container {
        @include flexbox();
        line-height: 0;

        .featured-item {
            @include flex-basis(50%);

            img {
                width: 100%;
            }
        }
    }

    @media #{$medium-and-down} {
        .top-panel {
            .subhead {
                font-size: 14px;
            }

            .top-panel-item {
                &.logo {
                    width: 120px;
                    margin: 0 20px 0 20px;
                }
            }
        }

        .featured-container {
            display: block;
        }
    }

    @media #{$small-and-down} {
        .top-panel {
            .subhead {
                font-size: 13px;
            }
            .top-panel-item {
                text-align: center;

                &.logo {
                    display: none;
                }
            }
        }
    }
</style>
