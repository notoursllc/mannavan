<script>
import IconVictory from '@/components/icons/IconVictory'

export default {
    components: {
        IconVictory
    },

    methods: {
        imageStyle(img) {
            return `background-image:url(${img})`;
        }
    },

    created() {
        this.$store.dispatch('ui/pageTitle', null);
    },

    head() {
        return {
            title: 'BreadVan',
            meta: [
                { vmid: 'description', name: 'description', content: `Apparel inspired by the good ol days of auto racing.` }
            ]
        }
    }
}
</script>


<template>
    <div class="widthAll">

        <div class="intro tac">
            <div class="animated fadeInDown animation-delay-3">
                <icon-victory icon-name="breadvan" class-name="fillGrayLight" />
            </div>

            <div class="animated fadeInDown">
                <div class="headline">{{ $t("Introducing Breadvan")}}</div>
                <div class="subheadline">We're inspired by the timeless styles and colors of the good 'ol days of auto racing.</div>
                <div class="colorGreen subheadline2">Yep, we only have 2 products right now!  More on the way!</div>
            </div>
        </div>

        <section class="featured-container">
            <nuxt-link
                :to="{ name: 'type-name-seouri', params: { name:'tops', seouri:'seo_uri_5'} }"
                tag="div"
                class="featured-item cursorPointer overflowHidden">
                <img class="animated fadeInLeft" src="https://gmnst-assets.nyc3.digitaloceanspaces.com/development/uploads/images/sample-300-x-400.png" />
            </nuxt-link>

            <nuxt-link
                :to="{ name: 'type-name-seouri', params: { name:'tops', seouri:'seo_uri_5'} }"
                tag="div"
                class="featured-item cursorPointer overflowHidden">
                <img class="animated fadeInRight" src="https://gmnst-assets.nyc3.digitaloceanspaces.com/development/uploads/images/sample_calbeamin.jpg" />
            </nuxt-link>
        </section>

    </div>
</template>


<style lang="scss" scoped>
    @import "~assets/css/components/_variables.scss";
    @import "~assets/css/components/_mixins.scss";

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

    .intro {
        position: relative;
        padding: 20px 0 20px;
        overflow: hidden;

        svg {
            width: 190px !important;
        }

        .headline {
            font-size: 36px;
        }
        .subheadline {
            font-size: 20px;
        }
        .subheadline2 {
            font-size: 16px;
        }
    }

    @media #{$medium-and-down} {
        .featured-container {
            display: block;
        }

        .intro {
            padding: 20px 0 30px;

            svg {
                width: 120px !important;
            }

            .headline {
                font-size: 26px;
            }
            .subheadline,
            .subheadline2 {
                font-size: 16px;
            }
        }
    }


    @media #{$small-and-down} {
        .intro {
            padding: 10px;

            svg {
                width: 100px !important;
            }

            .headline {
                font-size: 20px;
            }
            .subheadline,
            .subheadline2 {
                font-size: 12px;
            }
        }
    }
</style>
