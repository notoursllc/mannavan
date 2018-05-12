<script>
    import { mapGetters } from 'vuex'
    import shopping_cart_mixin from '@/mixins/shopping_cart_mixin'

    export default {
        props: {
            showEmail: {
                type: Boolean,
                default: true
            }
        },

        mixins: [
            shopping_cart_mixin
        ],

        // NOTE: any reference to a variable outside the scope of a Vue instance
        // will not be reactive, so using the cart from the getter will not work.
        // Need to use this.$store.state instead
        // Need to use https://stackoverflow.com/questions/45307974/vue-2-vuex-using-state-variables-in-computed-property#45308643
        computed: {
            ...mapGetters({
                shoppingCart: 'shoppingcart/cart'
            }),

            formattedName() {
                return this.getFormattedShippingName(this.shoppingCart.shipping_firstName, this.shoppingCart.shipping_lastName);
            },

            formattedCityStateZip: function() {
                return this.getFormattedCityStateZip(
                    this.shoppingCart.shipping_city,
                    this.shoppingCart.shipping_state,
                    this.shoppingCart.shipping_postalCode
                );
            },

            companyDisplay: function() {
                return this.getFormattedCompanyName(this.shoppingCart.shipping_company);
            }
        }
    }
</script>


<template>
    <div>
        <div>{{ formattedName }}</div>
        <div v-if="shoppingCart.shipping_company">{{ companyDisplay }}</div>
        <div>{{ shoppingCart.shipping_streetAddress }}</div>
        <div v-if="shoppingCart.shipping_extendedAddress">{{ shoppingCart.shipping_extendedAddress }}</div>
        <div>{{ formattedCityStateZip }}</div>
        <div>{{ shoppingCart.shipping_countryCodeAlpha2 }}</div>
        <div class="pts" v-if="showEmail">{{ shoppingCart.shipping_email }}</div>
    </div>
</template>
