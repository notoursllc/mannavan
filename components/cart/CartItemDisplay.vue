<script>
export default {
}
</script>

<template>
    <article class="cartItem is-flexbox">
        <!-- pic -->
        <div class="picCell">
            <slot name="pic"></slot>
        </div>

        <div class="content-cell">
            <div class="cart-item-header">
                <!-- title -->
                <slot name="title"></slot>
            </div>

            <div class="cart-item-footer">
                <!-- Variants -->
                <div class="cart-item-footer-cell">
                    <label>{{ $t('Size') }}:</label>
                    <span>
                        <slot name="size"></slot>
                    </span>
                </div>

                <!-- Price -->
                <div class="cart-item-footer-cell">
                    <label>{{ $t('Price') }}:</label>
                    <span>
                        <slot name="price"></slot>
                    </span>
                </div>

                <!-- Quantity -->
                <div class="cart-item-footer-cell">
                    <label>{{ $t('Quantity') }}:</label>
                    <span>
                        <slot name="quantity"></slot>
                    </span>
                </div>
            </div>
        </div>

        <div class="deleteButton">
            <slot name="delete-button"></slot>
        </div>
    </article>
</template>

<style lang="scss" scoped>
    @import "~assets/css/components/_variables.scss";
    @import "~assets/css/components/_mixins.scss";

    .is-flexbox {
        @include flexbox();
        @include flex-wrap(nowrap);
        @include flex-direction(row);
        @include align-content(stretch);
    }

    .cartItem {
        margin: 0 10px 20px 10px;
        background-color: #fff;
        @include box-shadow(0px, 1px, 2px, rgba(0,0,0,.1));
        transition: background-color .5s linear;
        position: relative;
        @include flexbox();
        @include flex-direction(row);

        .content-cell {
            @include flex-grow(1);
            @include flexbox();
            @include flex-direction(column);

            .cart-item-header {
                padding: 10px 20px !important;
                @include flex-grow(1);
            }

            .cart-item-footer {
                padding: 0;
                background: #f9f9f9;
                padding: 3px 0;

                @include flexbox();
                @include flex-wrap(nowrap);
                @include flex-direction(row);
            }

            .cart-item-footer-cell {
                display: inline-block;
                vertical-align: top;
                padding: 0 10px;
                @include flex-grow(1);
                text-align: center;

                >label,
                >span {
                    display: block;
                    font-size: 15px;
                    font-weight: 500;
                }

                >label {
                    font-size: 14px;
                    line-height: 25px;
                    font-weight: 300;
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

        .deleteButton {
            position: absolute;
            top: -5px;
            right: -5px;
            width: 20px;
            height: 20px;
        }
    }

    .cartItem.highlight {
        background-color: #d2f1d3;
    }
    .cartItem.fadeout {
        background-color: #fff;
    }
</style>
