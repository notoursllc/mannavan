<script>
import shopping_cart_mixin from '@/mixins/shopping_cart_mixin';

export default {
    name: 'AddressDisplay',

    props: {
        firstName: {
            type: String
        },
        lastName: {
            type: String
        },
        streetAddress: {
            type: String
        },
        extendedAddress: {
            type: String
        },
        company: {
            type: String
        },
        countryCode: {
            type: String
        },
        city: {
            type: String
        },
        state: {
            type: String
        },
        zip: {
            type: String
        }
    },

    mixins: [
        shopping_cart_mixin
    ],

    computed: {
        formattedName() {
            return shopping_cart_mixin.methods.getFormattedShippingName(
                this.firstName,
                this.lastName
            );
        },

        formattedCityStateZip() {
            return shopping_cart_mixin.methods.getFormattedCityStateZip(
                this.city,
                this.state,
                this.zip
            );
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
