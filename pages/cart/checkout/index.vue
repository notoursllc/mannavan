<script>
    import Vue from 'vue'
    import { mapGetters } from 'vuex'
    import CheckoutWizardBar from '@/components/checkout/CheckoutWizardBar'
    import ShippingAddressStep from '@/components/checkout/StepShippingAddress'
    import ShippingMethodStep from '@/components/checkout/StepShippingMethod'
    import PlaceOrderStep from '@/components/checkout/StepPlaceOrder'
    import KeepShoppingButton from '@/components/cart/KeepShoppingButton'

    let currentNotification = null;

    export default {
        components: {
            CheckoutWizardBar,
            ShippingAddressStep,
            ShippingMethodStep,
            PlaceOrderStep,
            KeepShoppingButton
        },

        computed: {
            ...mapGetters({
                shoppingCart: 'shoppingcart/cart',
            })
        },

        data: function() {
            return {
                stepComponent: 'shipping-address-step',
                STEP_SHIPPING_ADDRESS: 0,
                STEP_SHIPPING_METHOD: 1,
                STEP_PLACE_ORDER: 2,
                currentStep: 0
            }
        },

        methods: {
            componentDone: function(val) {
                switch(val) {
                    case 'shipping-address-step':
                        this.stepComponent = 'shipping-method-step';
                        this.currentStep = this.STEP_SHIPPING_METHOD;
                        break;

                    case 'shipping-method-step':
                        this.stepComponent = 'place-order-step';
                        this.currentStep = this.STEP_PLACE_ORDER;
                        break;

                    default:
                        this.stepComponent = 'shipping-address-step';
                        this.currentStep = this.STEP_SHIPPING_ADDRESS;
                }
            },

            checkoutStepChanged: function(newStep) {
                if(newStep < this.currentStep) {
                    this.currentStep = newStep;

                    switch(newStep) {
                        case this.STEP_SHIPPING_METHOD:
                            this.stepComponent = 'shipping-method-step';
                            break;

                        case this.STEP_PLACE_ORDER:
                            this.stepComponent = 'place-order-step';
                            break;

                        default:
                            this.stepComponent = 'shipping-address-step';
                    }
                }
            }
        },

        mounted: function() {
            this.$store.dispatch('ui/IN_CHECKOUT_FLOW', true);
            this.$store.dispatch('ui/pageTitle', this.$t('Checkout'));
        },

        head() {
            return {
                title: this.$t('Checkout'),
                meta: [
                    { vmid: 'description', name: 'description', content: `Your Shopping Cart at gmnst.com` }
                ]
            }
        }
    }
</script>


<template>
    <div class="pageContainerMax pageContainerMaxSkinny">
        <section v-if="shoppingCart.num_items" class="mbxl">
            <checkout-wizard-bar :step="currentStep" @change="checkoutStepChanged"></checkout-wizard-bar>
        </section>

        <div v-if="!shoppingCart.num_items" class="fs16 pal tac">
            {{ $t('Your shopping cart does not contain any items.') }}

            <div class="mtl">
                <keep-shopping-button></keep-shopping-button>
            </div>
        </div>

        <template v-else>
            <component v-bind:is="stepComponent" @done="componentDone"></component>
        </template>
    </div>
</template>
