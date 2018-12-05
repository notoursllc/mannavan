<script>
import Vue from 'vue'
import { Button } from 'element-ui'
import IconVictory from '@/components/icons/IconVictory'
import IconLogo from '@/components/icons/IconLogo'

Vue.use(Button);

let bgImages = [
    'bg_silver_car.jpg',
    'bg_black_5.jpg',
    'bg_yellow_mclaren.jpg',
    // 'bg_green_yellow_6.jpg',
    // 'bg_seven_eleven.jpg'
];

function randomIntFromInterval(min, max) {
    return Math.floor(Math.random()*(max-min+1)+min);
}


export default {
    components: {
        IconVictory,
        IconLogo
    },

    data: function() {
        return {
            bgImage: null
        }
    },

    methods: {
        imageStyle(img) {
            return `background-image:url(${img})`;
        },

        heroRedirect() {
            this.$router.push({
                name: 'type-name',
                params: {
                    name: 'tops'
                }
            });
        },

        setbBgImage() {
            let index = randomIntFromInterval(0, (bgImages.length - 1));
            this.bgImage = `/images/backgrounds/${ bgImages[index] }`;
        }
    },

    created() {
        this.setbBgImage();
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
    <div class="hero"
        :style="{ 'background-image': 'linear-gradient(rgba(0, 0, 0, 0.5),rgba(0, 0, 0, 0.5)), url(\'' + bgImage + '\')' }">

        <div class="intro">
            <div class="animated fadeInDown animation-delay-3">
                <icon-logo icon-name="breadvan" class-name="fillWhite" width="200px" />
            </div>

            <div class="animated fadeInDown">
                <div class="headline">{{ $t("Vintage. Racing.")}}</div>
                <div class="subheadline">{{ $t('An apparel company') }}</div>

                <div class="btn">
                    <el-button
                        round
                        @click="heroRedirect">{{ $t('Check out our first product') }}</el-button>
                </div>
            </div>
        </div>

    </div>
</template>


<style lang="scss" scoped>
    @import "~assets/css/components/_variables.scss";
    @import "~assets/css/components/_mixins.scss";

    .hero {
        width: 100vw;
        height: 100vh;
        background-position: center center;
        text-align: center;
        background-image: linear-gradient(rgba(0, 0, 0, 0.5),rgba(0, 0, 0, 0.5));
        background-size: cover;
        background-position: center center;
        background-repeat: no-repeat;
        background-attachment: fixed;
        @include flexbox();
        @include justify-content(center);
        @include align-items(center);
    }

    .intro {
        position: relative;
        padding: 20px 0 20px;
        overflow: hidden;
        color: #fff;
        font-family: Verdana, Geneva, sans-serif;

        svg {
            width: 200px !important;
        }

        .headline {
            font-size: 2em;
            margin-top: 20px;
        }

        .subheadline {
            font-size: 20px;
        }

        .btn {
            margin-top: 40px;
        }
    }

    @media #{$medium-and-down} {
        .intro {
            padding: 20px 0 30px;

            svg {
                width: 120px !important;
            }

            .headline {
                font-size: 26px;
            }
            .subheadline {
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
            .subheadline {
                font-size: 12px;
            }
        }
    }
</style>
