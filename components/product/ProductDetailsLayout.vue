<script>
export default {
    name: 'ProductDetailsLayout'
};
</script>


<template>
    <div class="prod-wrap">
        <div class="prod-container">

            <div class="prod-pics" v-if="$slots.pics">
                <slot name="pics"></slot>
            </div>

            <div class="prod-details">
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
    .prod-container, .prod-pics, .prod-details  {
        display: block;
    }

    .prod-container {
        background-color: #fff;
        border: 1px solid #e6e6e6;
        border-radius: 3px;
        max-width: 1440px;
    }

    .prod-details {
        padding: 0 5px;
    }

    @media (min-width: 1025px) {
        .prod-container {
            @include flexbox();
            margin: 0px auto;
        }

        .prod-pics {
            flex-grow: 3;
            flex-shrink: 1;
            flex-basis: 0%;
        }

        .prod-details {
            padding: 10px 20px;
            width: 400px;
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
