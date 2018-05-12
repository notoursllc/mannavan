<script>
export default {
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
        <section class="panel">
            <article>
                <h1>some text goes here</h1>
                <div>
                    <div class="btn">CALL TO ACTION</div>
                </div>
            </article>
            <div class="bg" :style="imageStyle('sample_calbeamin.jpg')" />
        </section>

        <section class="panel">
            <article>
                <h1>some text goes here</h1>
                <div>
                    <div class="btn">CALL TO ACTION</div>
                </div>
            </article>
            <div class="bg" :style="imageStyle('sample-300-x-400.png')" />
        </section>
    </div>
</template>


<style lang="scss">
    @import "~assets/css/components/_mixins.scss";

    .panel {
        height: 500px;
        background-color: #000;
        overflow: hidden;
        position: relative;
        background-repeat: no-repeat;
        background-position: center center;
        background-size: cover;

        article {
            position: relative;
            top: 40%;
            width: 100%;
            text-align: center;
            z-index: 5;
            color: #fff;
            font-size: 40px;
        }

        .btn {
            background-color: rgba(255,255,255,.70);
            color: #000;
            cursor: pointer;
            padding: 10px 35px;
            font-size: 16px;
            font-weight: 500;
            display: inline-block;
            text-transform: uppercase;
            @include grow();

            &:hover {
                background-color: rgba(255,255,255,.80);
                @include growHover();
            }
        }

        .bg {
            background-position: center center;
            background-size: cover;
            height: 110%;
            left: 0;
            position: absolute;
            top: 0;
            width: 100%;
        }
    }
    .promo-strip {
        height: 400px;
        // box-sizing: border-box;
        // margin: 0;
        // padding: 0;
        // position: relative;
        // text-align: center;
        // overflow: hidden;
    }

    .promo-strip-desc {
        background-color: #373e5d;
        color: #fff;
    }

    .promo-item {
        height: 400px;
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        position: relative;
        text-align: center;
        overflow: hidden;

        img {
            margin: 0;
            width: 10%;
            height: auto;
            transition: 1s;
            border: 1px solid red;
        }
    }

    .promo-item-desc {
        background-color: #373e5d;
        color: #fff;
    }

    .promo-item-image {
        overflow: hidden;
        // width: 100%;
        height: auto;
        max-height: 500px;
        top: 0;

        img {
            margin: 0;
            width: 100%;
            height: auto;
            transition: 1s;
        }
    }
</style>
