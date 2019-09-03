<script>
import { mapGetters } from 'vuex';
import isObject from 'lodash.isobject';
import forEach from 'lodash.foreach';
import cloneDeep from 'lodash.clonedeep';
import app_mixin from '@/mixins/app_mixin';
import shopping_cart_mixin from '@/mixins/shopping_cart_mixin';


export default {
    components: {
        ShippingBillingForm: () => import('@/components/checkout/ShippingBillingForm'),
        BottomPopover: () => import('@/components/BottomPopover'),
        CartItemMini: () => import('@/components/cart/CartItemMini'),
        CartTotalsTable: () => import('@/components/cart/CartTotalsTable')
    },

    mixins: [
        app_mixin,
        shopping_cart_mixin
    ],

    data: function() {
        return {
            loading: false
        }
    },

    computed: {
        ...mapGetters({
            shoppingCart: 'shoppingcart/cart',
            shippingAttributes: 'shoppingcart/shippingAttributes'
        }),

        shippingFormIsValid: {
            get: function() {
                return this.$store.state.checkout.validations.shippingForm;
            },
            set: async function(newVal) {
                await this.$store.dispatch('checkout/SHIPPING_FORM_VALID', newVal);
            }
        }
    },

    methods: {
        shippingFormDone: async function() {
            try {
                const shippingAttributes = cloneDeep(this.shippingAttributes);
                delete shippingAttributes.shipping_total;
                delete shippingAttributes.shipping_rate;
                delete shippingAttributes.shipping_fullName;

                // This step needs to clear the shipping rate cache because
                // we are assuming the shipping address has changed and thus
                // new rates should be retrieved
                await this.$store.dispatch('shoppingcart/CLEAR_SHIPPING_RATES_CACHE');

                // Setting the shipping address will also calculate the
                // sales tax for the cart because sales tax calculation requires
                // knowledge of the destination.  Sales tax needs to be set so
                // the API can return the shipping/tax/grand total amounts for the 'review'
                // checkout step
                const response = await this.setShippingAddress(shippingAttributes);
                this.setCartAndTokenStateFromResponse(response);

                const cart = response.data.data;

                if(!cart.billing_countryCodeAlpha2) {
                    cart.billing_countryCodeAlpha2 = cart.shipping_countryCodeAlpha2

                    if(!cart.billing_state) {
                        cart.billing_state = cart.shipping_state
                    }
                }

                this.shippingFormIsValid = true;
                this.$router.push({ name: 'cart-checkout-place-order' });
            }
            catch(err) {
                this.shippingFormIsValid = false;

                this.$errorMessage(
                    this.$t('A server error occurred while setting the shipping address'),
                    { closeOthers: true }
                );

                this.$bugsnag.notify(err, {
                    request: {
                        setShippingAddress: shippingAttributes
                    }
                });
            }
        },

        submitShippingForm: async function() {
            try {
                let c = this.shoppingCart;

                this.loading = true;

                const validateAddressConfig = {
                    name: `${c.shipping_firstName} ${c.shipping_lastName}`,
                    company: c.shipping_company,
                    street1: c.shipping_streetAddress,
                    city: c.shipping_city,
                    state: c.shipping_state,
                    zip: c.shipping_postalCode,
                    country: c.shipping_countryCodeAlpha2
                };

                const result = await this.validateAddress(validateAddressConfig);

                if(!isObject(result)
                    || !result.hasOwnProperty('validation_results')
                    || !result.validation_results.is_valid) {
                     this.$errorMessage(
                        this.$t('The address you provided does not seem to be a valid mailing adddress.'),
                        { closeOthers: true }
                    )
                }
                else {
                    // Updating the shipping attributes:
                    let updates = {};
                    updates.shipping_company = result.company;
                    updates.shipping_streetAddress = result.street1;
                    updates.shipping_city = result.city;
                    updates.shipping_state = result.state;
                    updates.shipping_postalCode = result.zip;
                    updates.shipping_countryCodeAlpha2 = result.country;

                    this.$store.dispatch('shoppingcart/CART_SET', updates);

                    await this.shippingFormDone();
                }

                this.loading = false;
            }
            catch(error) {
                let msg = error.message;

                if (error.response) {
                    msg = error.response.data.message;
                }

                this.$errorMessage(
                    msg || 'An internal server error occurred',
                    { closeOthers: true }
                );

                this.$bugsnag.notify(error, {
                    request: {
                        validateAddress: validateAddressConfig
                    }
                });

                this.loading = false;
            }
        },

        onShippingFormValid(isValid) {
            this.shippingFormIsValid = isValid;
        }
    },

    created() {
        if(this.cartEmptyRedirect(this.shoppingCart)) {
            return;
        }

        this.$store.dispatch('ui/IN_CHECKOUT_FLOW', true);
    },

    head() {
        return {
            title: this.$t('Checkout'),
            meta: [
                { vmid: 'description', name: 'description', content: `Your Shopping Cart at ${this.$store.state.ui.siteName}` }
            ]
        }
    }
}
</script>

<template>
    <div class="checkout-container">
        <div class="order-container">
            <div class="order-wrapper">

                <div class="g-spec-locked">
                    <div class="g-spec-label">
                        <span class="colorGreen fs20">{{ $t('Shipping') }}</span>
                    </div>

                    <div class="g-spec-content" v-loading="loading">
                        <shipping-billing-form
                            type="shipping"
                            @valid="onShippingFormValid" />

                        <div class="ptm tac">
                            <el-button
                                type="primary"
                                class="is-huge"
                                @click="submitShippingForm"
                                :disabled="!shippingFormIsValid"
                                round>{{ $t('SAVE') }}</el-button>

                            <bottom-popover
                                width="225px"
                                v-show="!shippingFormIsValid">{{ $t('fill_out_form_warning') }}</bottom-popover>
                        </div>
                    </div>
                </div>

            </div>
        </div>

        <div class="cart-container">
            <cart-item-mini
                v-for="item in shoppingCart.cart_items"
                :key="item.id"
                :cart-item="item" />

            <div class="ptl">
                <cart-totals-table
                    :cart="shoppingCart"
                    :show-shipping-cost="false"
                    :show-sales-tax="false" />
            </div>
        </div>
    </div>
</template>


<style lang="scss">
@import "@/assets/css/components/_checkout.scss";
</style>
