<script>
import shopping_cart_mixin from '@/mixins/shopping_cart_mixin';

export default {
    props: [
        'firstName',
        'lastName',
        'streetAddress',
        'extendedAddress',
        'company',
        'countryCode',
        'city',
        'state',
        'zip'
    ],

    mixins: [
        shopping_cart_mixin
    ],

    computed: {
        formattedName() {
            return shopping_cart_mixin.methods.getFormattedShippingName(this.firstName, this.lastName);
        },

        formattedCityStateZip: function() {
            return shopping_cart_mixin.methods.getFormattedCityStateZip(this.city, this.state, this.zip);
        },
    }
}
</script>

<template>
    <div>
        <div>{{ formattedName }}</div>
        <div>{{ company }}</div>
        <div>{{ streetAddress }}</div>
        <div>{{ extendedAddress }}</div>
        <div>{{ formattedCityStateZip }}</div>
        <div>{{ countryCode }}</div>
    </div>
</template>
