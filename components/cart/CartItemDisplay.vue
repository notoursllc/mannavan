<script>
export default {
}
</script>

<template>
    <article class="cartItem">

        <!-- pic -->
        <div class="picCell">
            <slot name="pic"></slot>
        </div>

        <div class="flexGrow pam">
            <div class="cartItemCols">
                <!-- title -->
                <div class="cartItemCol flexGrow">
                    <slot name="title"></slot>
                </div>

                <!-- Variants -->
                <div class="cartItemCol">
                    <label>{{ $t('Size') }}:</label>
                    <span>
                        <slot name="size"></slot>
                    </span>
                </div>

                <!-- Price -->
                <div class="cartItemCol">
                    <label>{{ $t('Price') }}:</label>
                    <span>
                        <slot name="price"></slot>
                    </span>
                </div>

                <!-- Quantity -->
                <div class="cartItemCol">
                    <label>{{ $t('Quantity') }}:</label>
                    <span>
                        <slot name="quantity"></slot>
                    </span>
                </div>
            </div>
        </div>
    </article>
</template>

<style lang="scss" scoped>
    @import "~assets/css/components/_variables.scss";
    @import "~assets/css/components/_mixins.scss";

    .cartItem {
        width: 100%;
        margin-bottom: 20px;
        background-color: #fff;
        @include box-shadow(0px, 1px, 2px, rgba(0,0,0,.1));
        transition: background-color .5s linear;
        @include flexbox();
        @include flex-wrap(nowrap);
        @include flex-direction(row);
        @include align-content(stretch);

        .cartItemCols {
            @include flexbox();
            @include flex-wrap(nowrap);
            @include flex-direction(row);
            @include align-content(stretch);

            .cartItemCol {
                padding: 0 15px;

                >label,
                >span {
                    display: block;
                }

                >label {
                    font-size: 12px;
                    color: #7e7e7e;
                }
            }
        }

        .picCell {
            width: 128px;
            min-height: 128px;
            position: relative;
        }

        .cartItemPic {
            position: absolute;
            width: 100%;
            height: 100%;
            background-size: cover;
            background-position: center;
        }
    }

    @media #{$medium-and-down} {
        .cartItemCols {
            @include flex-direction(column !important);
            @include align-items(flex-start !important);

            .cartItemCol {
                margin-bottom: 5px;
                display: table-row !important;

                >label,
                >span {
                    display: inline-block !important;
                }

                >label {
                    padding-right: 10px;
                    vertical-align: top;
                }
            }
        }
    }

    .cartItem.highlight {
        background-color: #d2f1d3;
    }
    .cartItem.fadeout {
        background-color: #fff;
    }
</style>
