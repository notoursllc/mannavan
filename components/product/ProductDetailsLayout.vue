<script>
export default {
    name: 'ProductDetailsLayout'
};
</script>


<template>
    <div class="prod-wrap">
        <div class="prod-container">

            <div class="prod-pics" v-if="$slots.pics">
                <div class="prod-pics-wrap">
                    <slot name="pics"></slot>
                </div>
            </div>

            <div class="details-container">
                <!-- title -->
                <div v-if="$slots.title" class="prod-title">
                    <slot name="title"></slot>
                </div>

                <!-- desc -->
                <div v-if="$slots.description" class="prod-desc">
                    <slot name="description"></slot>
                </div>

                <!-- price -->
                <div v-if="$slots.price" class="prod-price">
                    <slot name="price"></slot>
                </div>

                <!-- thumbs -->
                <div v-if="$slots.thumbs" class="prod-thumbs">
                    <slot name="thumbs"></slot>
                </div>

                <!-- attributes -->
                <div v-if="$slots.attributes" class="prod-attrs">
                    <slot name="attributes"></slot>
                </div>

                <!-- button -->
                <div v-if="$slots.button" class="prod-btn">
                    <slot name="button"></slot>
                </div>
            </div>
        </div>

        <div v-if="$slots.under">
            <slot name="under"></slot>
        </div>
    </div>
</template>


<style lang="scss">
@import '~assets/css/components/_variables.scss';
@import "~assets/css/components/_mixins.scss";

.prod-wrap {
    .prod-container, .prod-pics, .details-container  {
        display: block;
    }

    .details-container {
        padding: 0 5px;
        // border: 1px solid aqua;
    }

     .prod-pics-wrap {
        display: block;

        img {
            width: 100%;
        }
    }

    @media #{$medium-and-up} {
        .prod-pics {
            // @include flexbox();
            flex-grow: 3;
            flex-shrink: 1;
            flex-basis: 0%;
            // border: 1px solid red;

            .prod-pics-wrap {
                @include flexbox();
                @include justify-content(space-between);
                @include align-items(flex-start);
            }
        }
    }

    @media #{$large-and-up} {
        .prod-container {
            @include flexbox();
            max-width: 1440px;
            margin: 0px auto;
            background-color: #fff;
            border: 1px solid #e6e6e6;
            border-radius: 3px;
            // @include flex-wrap(wrap);
        }

        .details-container {
            // @include flex(none);
            // width: 33.33333%;
            // padding: 0 30px;
            // @include flexbox();
            flex-grow: 1;
            flex-shrink: 1;
            flex-basis: 0%;
            padding: 10px 20px;
            width: 750px;
        }
    }

    .prod-title {
        font-size: 24px;
        font-weight: 500;
    }

    .prod-desc {
        font-size: 16px;
        word-wrap: break-word;
    }

    .prod-price {
        font-size: 16px;
        font-weight: 500;
        margin-top: 10px;
    }

    .prod-thumbs {
        margin-top: 20px;
    }

    .prod-attrs {
        margin-top: 20px;
    }

    .prod-btn {
        margin-top: 20px;
        text-align: center;
    }
}
</style>
