<script>
export default {
    props: {
        bgImage: {
            type: String,
            default: ''
        }
    },

    computed: {
        heroMainStyle() {
            if(this.bgImage) {
                return {
                    'background-image': `linear-gradient(rgba(0, 0, 0, 0.1),rgba(0, 0, 0, 0.3)), url('${this.bgImage}')`
                };
            }
            return {};
        }
    }
};
</script>


<template>
    <div class="hero-main" :style="heroMainStyle">
        <div class="hero-content">
            <slot></slot>
        </div>
    </div>
</template>


<style lang="scss">
    @import "~assets/css/components/_mixins.scss";
    @import "~assets/css/components/_variables.scss";

    .hero-main {
        @include flexbox();
        @include flex-direction(column);
        @include justify-content(space-between);
        @include align-items(stretch);
        @include align-content(stretch);
        background:#FFFFFF;
        background-position: top center;
        // background-image: linear-gradient(rgba(0, 0, 0, 0.5),rgba(0, 0, 0, 0.5));
        background-size: cover;
        background-repeat: no-repeat;
        // background-attachment: fixed;
        color:#FF0077;
        text-align: left;
        position: relative;
        font-size: 16px;
        overflow: hidden;
        border-radius: 0 0 3px 3px;

        .hero-content {
            // @include flex-basis(100%);
            width: 100%;
            margin: 0 auto;
            @include flexbox();
            @include flex-direction(row);
            @include align-items(center);
            // @include justify-content(flex-start);
            box-sizing: border-box;
            position: relative;
            // padding: 2vh 2rem;
            padding: 50px;
            max-width: $header-max-width;
            z-index: 2;
        }

        .home-copy-55 {
            @include flex-basis(55%);
            width: 55%;
        }

        .heading-icon {
            display: inline-block;
            margin-right: 30px;

            svg g {
                fill: rgba(255, 255, 255, .4)
            }
        }

        .heading-text {
            display: inline-block;

            .heading {
                line-height: 1.3;
                font-size: 40px;
                font-weight: 300;
                color: #f1eded;
            }

            .sub-heading {
                margin-top: 10px;
                color: #fff;
            }

            mark {
                color: #fff;
                background-color: rgba(0,0,0,.3);
                padding: 0;
            }
        }
    }

    @media #{$medium-and-down} {
        .hero-main {
            .hero-content {
                padding: 20px;
            }

            .home-copy-55 {
                @include flex-basis(100%);
                width: 100%;
            }

            .heading-icon {
                display: none;
            }

            .heading-text {
                .heading {
                    font-size: 30px;
                }
            }
        }
    }
</style>
