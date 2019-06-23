<script>
export default {
    props: {
        bgImage: {
            type: String
        }
    },

    computed: {
        heroContentStyle() {
            if(this.bgImage) {
                return {
                    'background-image': `linear-gradient(rgba(0, 0, 0, 0.5),rgba(0, 0, 0, 0.5)), url('${this.bgImage}')`
                }
            }
        }
    }
}
</script>


<template>
    <div class="hero-main">
        <div class="hero-content" :style="heroContentStyle">
            <slot></slot>
        </div>
    </div>
</template>


<style lang="scss">
    @import "~assets/css/components/_mixins.scss";

    .hero-main {
        @include flexbox();
        @include flex-direction(column);
        @include justify-content(space-between);
        @include align-items(stretch);
        @include align-content(stretch);
        background:#FFFFFF;
        color:#FF0077;
        text-align: left;
        position: relative;
        font-size: 16px;
        overflow: hidden;

        .hero-content {
            background-position: center center;
            background-image: linear-gradient(rgba(0, 0, 0, 0.5),rgba(0, 0, 0, 0.5));
            background-size: cover;
            background-repeat: no-repeat;
            background-attachment: fixed;
            @include flex-basis(100%);
            width: 100%;
            margin: 0 auto;
            z-index: 2;
            @include flexbox();
            @include align-items(center);
            @include justify-content(flex-start);
            box-sizing: border-box;
            position: relative;
            // padding: 2vh 2rem;
            padding: 50px 50px;
            // max-width: 70rem;
            // border: 1px solid blue;
        }

        .home-copy-55 {
            @include flex-basis(55%);
            width: 55%;
        }

        .heading {
            line-height: 1;
            font-size: 40px;
            font-weight: 650;
            margin-bottom: 10px;
            color: #fff;
        }

        .sub-heading {
            margin-top: 10px;
            color: #fff;
        }
    }
</style>
