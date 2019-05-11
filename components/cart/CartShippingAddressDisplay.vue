<script>
import shopping_cart_mixin from '@/mixins/shopping_cart_mixin';

export default {
    name: 'CartShippingAddressDisplay',

    props: {
        shoppingCart: {
            type: Object,
            required: true
        }
    },

    mixins: [
        shopping_cart_mixin
    ],

    computed: {
        formattedName() {
            return shopping_cart_mixin.methods.getFormattedShippingName(this.shoppingCart.shipping_firstName, this.shoppingCart.shipping_lastName);
        },

        formattedCityStateZip: function() {
            return shopping_cart_mixin.methods.getFormattedCityStateZip(this.shoppingCart.locality, this.shoppingCart.region, this.shoppingCart.postalCode);
        },
    }
}
</script>

<template>
    <div>
        <div>{{ formattedName }}</div>
        <div>{{ shoppingCart.shipping_company }}</div>
        <div>{{ shoppingCart.shipping_streetAddress }}</div>
        <div>{{ shoppingCart.shipping_extendedAddress }}</div>
        <div>{{ formattedCityStateZip }}</div>
        <div>{{ shoppingCart.countryCodeAlpha2 }}</div>
    </div>
</template>
