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

            formattedOneLine() {
                const parts = [];

                // first & last name
                parts.push(
                    this.getFormattedShippingName(
                        this.shoppingCart.shipping_firstName,
                        this.shoppingCart.shipping_lastName
                    )
                );

                // company
                if(this.shoppingCart.shipping_company) {
                    parts.push(
                        this.getFormattedCompanyName(this.shoppingCart.shipping_company)
                    )
                }

                // street address
                parts.push(
                    this.shoppingCart.shipping_streetAddress
                )

                // extended address
                if(this.shoppingCart.shipping_extendedAddress) {
                    parts.push(
                        this.shoppingCart.shipping_extendedAddress
                    )
                }

                parts.push(
                    // city, state, zip
                    this.getFormattedCityStateZip(
                        this.shoppingCart.shipping_city,
                        this.shoppingCart.shipping_state,
                        this.shoppingCart.shipping_postalCode
                    ),

                    // country
                    this.shoppingCart.shipping_countryCodeAlpha2
                )

                return parts.join(', ');
            }
        }
    }
</script>


<template>
    <div>
        <div>{{ formattedOneLine }}</div>
        <div class="pts" v-if="showEmail">{{ shoppingCart.shipping_email }}</div>
    </div>
</template>
