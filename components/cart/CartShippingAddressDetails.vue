<script>
import {
    FigAddress,
    FigIcon,
    FigIconLabel
} from '@notoursllc/figleaf';

export default {
    name: 'CartShippingAddressDetails',

    components: {
        FigAddress,
        FigIcon,
        FigIconLabel
    },

    props: {
        cart: {
            type: Object,
            required: true
        }
    }
};
</script>

<template>
    <div>
        <fig-address
            :first-name="cart.shipping_firstName"
            :last-name="cart.shipping_lastName"
            :street-address="cart.shipping_streetAddress"
            :extended-address="cart.shipping_extendedAddress"
            :city="cart.shipping_city"
            :state="cart.shipping_state"
            :zip="cart.shipping_postalCode"
            :email="cart.shipping_email"
            :phone="cart.shipping_phone" />

        <!-- is gift -->
        <div class="mt-1" v-if="cart.is_gift">
            <div class="py-1 px-2 inline-block bg-gray-100 rounded">
                <fig-icon-label>
                    <fig-icon
                        slot="left"
                        icon="gift"
                        :width="20"
                        :height="20" />
                    {{ $t('Order is a gift') }}
                </fig-icon-label>
            </div>
        </div>
    </div>
</template>
