<script>
import isObject from 'lodash.isobject';
import IconVictoryPeace from '@/components/icons/IconVictoryPeace';
import CartReceipt from '@/components/cart/CartReceipt';
import {
    FigIcon,
    FigCheckoutWrapper,
    FigSpinner
} from '@notoursllc/figleaf';

export default {
    components: {
        IconVictoryPeace,
        CartReceipt,
        FigIcon,
        FigCheckoutWrapper,
        FigSpinner
    },

    data: function() {
        return {
            shippingEmail: null,
            ready: false
        };
    },

    head() {
        return {
            title: this.$t('We have a winner!'),
            meta: [
                { vmid: 'description', name: 'description', content: `Thanks for your order from ${this.$store.state.ui.siteName}` }
            ]
        };
    },

    methods: {
        onCartFound(cart) {
            if(isObject(cart)) {
                this.shippingEmail = cart.shipping_email;
                this.ready = true;
            }
            else {
                this.shippingEmail = null;
                this.ready = false;
            }
        }
    }
};
</script>


<template>
    <div>
        <div v-if="!ready" class="py-10 flex justify-center">
            <fig-spinner :width="40" />
        </div>

        <template v-else>
            <header class="hero tac">
                <div class="pt-7 pb-10">
                    <div class="flex items-center justify-center">
                        <div class="sway">
                            <icon-victory-peace icon-name="thanks" width="125px" />
                        </div>

                        <div class="text-center">
                            <div class="font-bold text-2xl md:text-4xl">{{ $t('Victory!') }}</div>
                            <div class="md:text-xl">{{ $t('We have received your order.') }}</div>
                        </div>
                    </div>
                </div>

                <div class="animation-wrapper center-position">
                    <div class="racecar">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 166.2 45.81"><title>race_car</title><path d="M85.33,21.1a15.06,15.06,0,0,1-.41-4.2c1.73-5.22,10.23-3.56,10.16.9L95,23.21S86.36,22.3,85.33,21.1Z" style="fill:#fff"/><path d="M91.19,18l3.89.05,0,3.41S91.88,20.76,91.19,18Z" style="fill:#231f20"/><polygon points="7.29 23.21 26.17 37.84 29.62 27.61 16.38 21.77 7.29 23.21" style="fill:#ccccca"/><path d="M85.84.78l-.15,9.84c0,.85.25,1-1.24,1.21A1.62,1.62,0,0,0,83,13.44a30.9,30.9,0,0,0,0,3.72c-.1,6.44,12.74,5.09,12.74,5.09l9.5-.15,13.75.13c6.74,4.09,18,9.9,18,9.9l26.19,9.71,0,1.34-120.43.36,2-14.38,21.58-17s1-6.95,1-7.79C67.37.74,71.46.21,71.46.21,76.86-.49,85.84.78,85.84.78Z" style="fill:#ed1d24"/><polygon points="85.72 9.05 66.76 8.77 67.23 5.28 85.77 5.55 85.72 9.05" style="fill:#fff"/><circle cx="36.23" cy="33.22" r="12.58" style="fill:#231f20"/><circle cx="36.23" cy="33.22" r="6.61" style="fill:#e5d689"/><circle cx="36.23" cy="33.22" r="5.29" style="fill:#877f4c"/><circle cx="36.23" cy="33.22" r="1.79" style="fill:#4c462e"/><circle cx="134.86" cy="35.41" r="10.4" style="fill:#231f20"/><circle cx="134.86" cy="35.41" r="6.28" style="fill:#e5d689"/><circle cx="134.86" cy="35.41" r="5.03" style="fill:#877f4c"/><circle cx="134.86" cy="35.41" r="1.79" style="fill:#4c462e"/><path d="M148.44,35.38a14.45,14.45,0,0,0,15.46,9.08c3.79-.21,2.08-3.6.6-3.71-13.68-3.12-12.65-4.58-12.47-5.69C152.36,33.24,148.29,33.53,148.44,35.38Z" style="fill:#ccccca"/><path d="M1.35,15.3c-1.23.69-3.72,9,4.32,9.16a116.7,116.7,0,0,0,18.15-1.65s7.55-6.18.1-7.17S2.59,14.62,1.35,15.3Z" style="fill:#ed1d24"/><rect x="101.59" y="28.68" width="15.83" height="12.18" rx="2" style="fill:#fff"/><rect x="108.72" y="30.49" width="1.58" height="8.62" style="fill:#231f20"/><polygon points="47.96 26.59 126.53 26.59 123.78 25.1 49.84 25.1 47.96 26.59" style="fill:#fff"/><path d="M65.18,29.43c-1.24,0-.89,10.68,0,10.68s4.06-4.28,15.42-4.28V33.71C69.24,33.71,66.42,29.43,65.18,29.43Z" style="fill:#aa1f23"/></svg>
                    </div>
                </div>

                <div class="dotted"></div>
            </header>

            <!-- email info -->
            <div class="text-center p-4 bg-gray-200">
                <div class="text-green-600">
                    <span class="text-base">{{ $t('An email confirmation was sent to:') }}</span>
                    <div class="text-center">
                        <fig-icon
                            icon="mail"
                            :stroke-width="1"
                            :width="50"
                            :height="50" />
                    </div>
                    <div class="font-bold text-lg">
                        {{ shippingEmail }}
                    </div>
                </div>

                <div class="text-sm mt-1">({{ $t('Please allow a few minutes for email delivery.') }})</div>
            </div>
        </template>

        <!-- order details -->
        <fig-checkout-wrapper class="px-4">
            <cart-receipt
                :cart-id="$route.params.id"
                @found="onCartFound" />
        </fig-checkout-wrapper>
    </div>
</template>


<style scoped>
.center-position {
    position: absolute;
    left: 50%;
    -webkit-transform: translateX(-50%);
    -ms-transform: translateX(-50%);
    -moz-transform: translateX(-50%);
    -o-transform: translateX(-50%);
    transform: translateX(-50%);
}

.animation-wrapper {
    width: 700px;
    bottom: 0;
}

.dotted {
    position: absolute;
    bottom: -4px;
    left: 0;
    height: 1px;
    width: 100%;
    background: repeating-linear-gradient(
        to right,
        red,
        red 10px,
        #fff 10px,
        #fff 20px
    );
}

.racecar {
    position: absolute;
    bottom: -2px;
    display: block;
    opacity: 0;
    width: 90px;
    height: 26px;
    animation-name: victoryLap;
    animation-duration: 20s;
    animation-delay: .3s;
    animation-timing-function: ease;
    animation-iteration-count: infinite;
}

.hero {
    background: linear-gradient(#64a865, #74b675);
    position: relative;
    color: #fff;
    padding: 0;
    border-bottom: 4px solid #4f4f4f;
}

@keyframes victoryLap {
    0% {
        opacity: 0;
        left: -1080px;
    }
    2%,98% {
        opacity:1
    }
    /*
    40%,60% {
         left:30px;
    }
    */
    40%,60% {
        left:300px;
    }
    to {
        opacity:0;
        left:1780px;
    }
}
</style>
