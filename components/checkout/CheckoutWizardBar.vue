<script>
export default {
    props: {
        step: {
            type: Number,
            default: 1
        }
    },

    components: {
        IconAddress: () => import('@/components/icons/IconAddress'),
        IconPackage: () => import('@/components/icons/IconPackage'),
        IconVan: () => import('@/components/icons/IconVan'),
        IconCheckSquare: () => import('@/components/icons/IconCheckSquare')
    },

    data: function() {
        return {
            currentStep: 1,
            // shippingAddressStep: 1,
            // shippingMethodStep: 2,
            // placeOrderStep: 3

            // Removing the Shipping Method selection step while we
            // are only offering one selection:
            shippingAddressStep: 1,
            placeOrderStep: 2
        }
    },

    created() {
        this.currentStep = this.step;
    },

    methods: {
        /**
            * Changes the current step number if the new step is less than
            * the current step
            */
        changeStep(stepNum) {
            if(this.currentStep > stepNum) {
                this.currentStep = stepNum;
                this.$emit('change', stepNum)
            }
        }
    },

    watch: {
        'step' (to, from) {
            this.currentStep = to;
        }
    }
}
</script>


<template>
    <div class="checkout-wizard">

        <!-- shipping address -->
        <div class="item"
             :class="{'active': currentStep === shippingAddressStep, 'completed': currentStep > shippingAddressStep}"
             @click="changeStep(shippingAddressStep)">
            <div class="item-icon">
                <icon-check-square
                    v-if="currentStep > shippingAddressStep"
                    icon-name="checkmark"
                    class-name="fillGreen"
                    width="20px" />
                <icon-address
                    v-if="currentStep === shippingAddressStep"
                    icon-name="address"
                    :class-name="currentStep === shippingAddressStep ? 'fillGreen' : 'fillGrayLight'"
                    width="30px" />
            </div>
            <div class="item-desc">
                {{ shippingAddressStep }}) {{ $t('SHIPPING ADDRESS') }}
            </div>
        </div>

        <div class="spacer">
            <hr style="width:100%;" />
        </div>

        <!-- shipping method -->
        <div class="item"
             :class="{'active': currentStep === shippingMethodStep, 'completed': currentStep > shippingMethodStep}"
             @click="changeStep(shippingMethodStep)">
            <div class="item-icon">
                <icon-check-square
                    v-if="currentStep > shippingMethodStep"
                    icon-name="checkmark"
                    class-name="fillGreen"
                    width="20px" />
                <icon-van
                    v-if="currentStep <= shippingMethodStep"
                    icon-name="van"
                    :class-name="currentStep < shippingMethodStep ? 'fillGrayLight' : 'fillGreen'"
                    width="30px" />
            </div>
            <div class="item-desc">
                {{ shippingMethodStep }}) {{ $t('SHIPPING METHOD') }}
            </div>
        </div>

        <div class="spacer">
            <hr style="width:100%;" />
        </div>

        <!-- place order -->
        <div class="item"
             :class="{'active': currentStep === placeOrderStep}"
             @click="changeStep(placeOrderStep)">
            <div class="item-icon">
                <icon-package
                    icon-name="package"
                    :class-name="currentStep === placeOrderStep ? 'fillGreen' : 'fillGrayLight'"
                    width="30px" />
            </div>
            <div class="item-desc">
                {{ placeOrderStep }}) {{ $t('PLACE YOUR ORDER') }}
            </div>
        </div>
    </div>
</template>


<style lang="scss">
    @import "../../assets/css/components/_variables.scss";
    @import "../../assets/css/components/_mixins.scss";

    .checkout-wizard {
        width: 100%;
        @include flexbox();
        @include flex-direction(row);
        @include align-items(center);
        @include flex-wrap(nowrap);

        .item,
        .spacer {
            text-align: center;
            color: $colorGrayLighter !important;
            vertical-align: middle;
        }

        .spacer {
            padding: 0 8px;
            @include flex-grow(1);
        }

        .item {
            // font-size: 20px;
            font-size: 25px;
            padding: 10px;
            @include border-radius(5px);
            // line-height: 18px;
            border: 1px solid transparent;

            .item-icon {
                vertical-align: middle;
                display: none;
            }

            .item-desc {
                font-size: 12px;
                white-space: normal;
                line-height: 12px;
            }

            &.active {
                background-color: #effbee;
                border: 3px solid #fff;
                color: $colorGreen !important;
                @include box-shadow(0, 10px, 30px, rgba(0, 0, 0, 0.1));
            }

            &.completed {
                color: $colorGreen !important;
                cursor: pointer;

                &:hover {
                    border: 1px solid #c8e2c7;
                }
            }
        }
    }

    @media #{$medium-and-up} {
        .checkout-wizard {
            .spacer {
                padding: 0 15px;
            }

            .item {
                font-size: 25px;
                line-height: 25px;
                padding: 4px;

                .item-icon {
                    display: block;
                }

                .item-desc {
                    white-space: nowrap;
                    line-height: 20px;
                }
            }
        }
    }
</style>
