<script>
import ProductPrice from '@/components/product/ProductPrice';
import CartTotalsTable from '@/components/cart/CartTotalsTable';
import {
    FigOverlay,
    FigAddress,
    FigCardLastFour,
    FigTableSimple,
    FigTh,
    FigTd
} from '@notoursllc/figleaf';

export default {
    components: {
        ProductPrice,
        CartTotalsTable,
        FigOverlay,
        FigAddress,
        FigCardLastFour,
        FigTableSimple,
        FigTh,
        FigTd
    },

    props: {
        cartId: {
            type: String
        }
    },

    data: function() {
        return {
            loading: false,
            cart: {},
            payment: {}
        };
    },

    computed: {
        paymentMethodCard() {
            return this.payment.payment_method_details ? this.payment.payment_method_details.card : {};
        }
    },

    created() {
        if(this.cartId) {
            this.init();
        }
    },

    methods: {
        async init() {
            this.loading = true;
            await this.getCart();
            await this.getPayment();
            this.loading = false;
        },

        async getCart() {
            try {
                const { data } = await this.$api.cart.get({
                    id: this.cartId,
                    _withRelated: '*'
                });

                this.cart = data;

                this.$emit('found', {
                    ...this.cart
                });
            }
            catch(err) {
                this.$figleaf.errorToast({
                    title: this.$t('An error occurred')
                });

                this.$bugsnag.notify(err);
            }
        },

        async getPayment() {
            try {
                const { data } = await this.$api.cart.payment.get(this.cart.id);
                this.payment = data;
            }
            catch(err) {
                this.$figleaf.errorToast({
                    title: this.$t('An error occurred')
                });

                this.$bugsnag.notify(err);
            }
        },

        getBillingAddressProperty(prop) {
            return this.cart.billing_same_as_shipping ? this.cart[`shipping_${prop}`] : this.cart[`billing_${prop}`];
        }
    }
};
</script>


<template>
    <div>
        <div v-if="!loading && !cart" class="text-center">
            {{ $t('Oops we could not find the order you are looking for.') }}
        </div>

        <div v-else>
            <fig-overlay :show="loading">

                <!-- order details -->
                <div class="flex flex-wrap -mx-2 pt-5">

                    <!-- shipping -->
                    <div class="my-2 px-2 w-full sm:w-1/3">
                        <div class="font-semibold">{{ $t('Shipping') }}:</div>
                        <div class="pt-2">
                            <fig-address
                                :first-name="cart.shipping_firstName"
                                :last-name="cart.shipping_lastName"
                                :street-address="cart.shipping_streetAddress"
                                :extended-address="cart.shipping_extendedAddress"
                                :city="cart.shipping_city"
                                :state="cart.shipping_state"
                                :zip="cart.shipping_postalCode" />
                        </div>
                    </div>

                    <!-- billing -->
                    <div
                        class="my-2 px-2 w-full sm:w-1/3">
                        <div class="font-semibold">{{ $t('Billing') }}:</div>
                        <div class="pt-2">
                            <fig-address
                                :first-name="getBillingAddressProperty('firstName')"
                                :last-name="getBillingAddressProperty('lastName')"
                                :street-address="getBillingAddressProperty('streetAddress')"
                                :extended-address="getBillingAddressProperty('extendedAddress')"
                                :city="getBillingAddressProperty('city')"
                                :state="getBillingAddressProperty('state')"
                                :zip="getBillingAddressProperty('postalCode')" />
                        </div>
                    </div>

                    <!-- payment -->
                    <div class="my-2 px-2 w-full sm:w-1/3">
                        <div class="font-semibold">{{ $t('Payment') }}:</div>
                        <div class="pt-2">
                            <div>
                                {{ `${getBillingAddressProperty('firstName')} ${getBillingAddressProperty('lastName')}`.trim() }}
                            </div>
                            <div>
                                <fig-card-last-four
                                    :type="paymentMethodCard.brand"
                                    :last-four="paymentMethodCard.last4" />
                            </div>
                            <div>
                                {{ $t('Expiration') }}: {{ paymentMethodCard.exp_month }}/{{ paymentMethodCard.exp_year }}
                            </div>
                        </div>
                    </div>
                </div>

                <!-- cart items -->
                <div class="pt-5">
                    <fig-table-simple
                        striped
                        hover
                        bordered>
                        <template slot="head">
                            <tr>
                                <fig-th>{{ $t('Item') }}</fig-th>
                                <fig-th>{{ $t('Qty / Price') }}</fig-th>
                            </tr>
                        </template>

                        <tr v-for="(item, index) in cart.cart_items" :key="index">
                            <!-- item -->
                            <fig-td class="">
                                {{ item.product.title }}
                            </fig-td>

                            <!-- qty / price -->
                            <fig-td class="">
                                {{ $n(item.qty) }} @
                                <product-price
                                    :variant="item.product_variant"
                                    :sku="item.product_variant_sku" />
                            </fig-td>
                        </tr>
                    </fig-table-simple>
                </div>

                <div class="pt-6">
                    {{ $t('Order number') }}: {{ cart.id }}
                </div>

                <div class="pt-6 flex justify-end">
                    <div>
                        <cart-totals-table
                            :cart="cart"
                            shipping
                            sales-tax />
                    </div>
                </div>
            </fig-overlay>
        </div>
    </div>
</template>
