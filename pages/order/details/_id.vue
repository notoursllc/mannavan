<script>
import Vue from 'vue'
import { Loading } from 'element-ui'
import PaymentTypeDisplay from '@/components/PaymentTypeDisplay'
import ProductPrice from '@/components/product/ProductPrice'
import CartTotalsTable from '@/components/cart/CartTotalsTable'
import product_mixin from '@/mixins/product_mixin'
import order_mixin from '@/mixins/order_mixin'

Vue.use(Loading.directive)

export default {
    components: {
        PaymentTypeDisplay,
        ProductPrice,
        CartTotalsTable
    },

    mixins: [
        order_mixin,
        product_mixin
    ],

    data: function() {
        return {
            loading: true
        }
    },

    created() {
        this.getOrder(this.$route.params.id, true)
            .then((order) => {
                this.order = order;
                this.orderExists = true;
            })
            .catch((e) => {
                this.orderExists = false;
                bugsnagClient.notify(e);
            })
            .finally(() => {
                this.loading = false;
            });

        this.$store.dispatch('ui/pageTitle', this.$t('Order Details'));
    },

    head() {
        return {
            title: this.$t('Order Details'),
            meta: [
                { vmid: 'description', name: 'description', content: `Order Details for your order from Gmnst` }
            ]
        }
    }
}
</script>

<template>
    <div class="pageContainerMax" v-loading="loading">

        <div v-if="!orderExists" class="tac">
            {{ $t('Oops we could not find the order you are looking for.') }}
        </div>

        <div v-else>
            <div class="mbl">
                <div class="displayTableRow">
                    <div class="displayTableCell prm">{{ $t('Ordered on') }}:</div>
                    <div class="displayTableCell">{{ order.created | format8601 }}</div>
                </div>

                <div class="displayTableRow">
                    <div class="displayTableCell prm">{{ $t('Order') }}:</div>
                    <div class="displayTableCell">{{ order.transaction.id }}</div>
                </div>
            </div>

            <div>
                <div class="mbl mrxl inlineBlock vat">
                    <div class="fwb">{{ $t('Shipping to') }}:</div>
                    <div>
                        <div>{{ formattedName }}</div>
                        <div v-if="order.shipping.company">{{ companyDisplay }}</div>
                        <div>{{ order.shipping.streetAddress }}</div>
                        <div v-if="order.shipping.extendedAddress">{{ order.shipping.extendedAddress }}</div>
                        <div>{{ formattedCityStateZip }}</div>
                        <div>{{ order.shipping.countryCodeAlpha2 }}</div>
                    </div>
                </div>

                <div class="mbl mrxl inlineBlock vat">
                    <div class="fwb">{{ $t('Payment method') }}:</div>
                    <div>
                        <payment-type-display :card-type="cardType"
                                            :last-four="order.transaction.payment.last4"
                                            :payer-email="order.transaction.payment.payerEmail"></payment-type-display>
                    </div>
                </div>

                <div class="mbl inlineBlock vat">
                    <div class="fwb">{{ $t('Order summary') }}:</div>
                    <div>
                        <cart-totals-table :cart="order.shoppingCart"
                                        :show-shipping-cost="true"
                                        :show-sales-tax="true"
                                        label-class="tal"></cart-totals-table>
                    </div>
                </div>
            </div>

            <div>
                <article v-for="item in order.shoppingCart.cart_items"
                        :key="item.id"
                        class="cartItem"
                        :id="'cartItem' + item.id">
                    <div class="cartItemPic">
                        <figure class="image is-128x128">
                            <img v-bind:src="featuredProductPic(item.product)">
                        </figure>
                    </div>

                    <div class="cartItemInfo">
                        <div class="cartItemInfoContent">
                            <div class="cartItemMain">
                                <a class="itemTitle" @click="goToProductDetails(item.product.seo_uri)">{{ item.product.title }}</a>
                            </div>

                            <!-- Variants -->
                            <div class="cartItemCol">
                                <div v-if="item.variants && item.variants.size">
                                    <label class="itemLabel">{{ $t('Size') }}:</label>
                                    <div class="itemVal">{{ $t(item.variants.size) }}</div>
                                </div>
                            </div>

                            <!-- Price -->
                            <div class="cartItemCol">
                                <label class="itemLabel">{{ $t('Price' )}}:</label>
                                <div class="itemVal"><product-price :product="item.product"></product-price></div>
                            </div>

                            <!-- Quantity -->
                            <div class="cartItemCol">
                                <label class="itemLabel">{{ $t('Quantity' )}}:</label>
                                <div>{{ item.qty }}</div>
                            </div>
                        </div>
                    </div>
                </article>
            </div>
        </div>

    </div>
</template>
