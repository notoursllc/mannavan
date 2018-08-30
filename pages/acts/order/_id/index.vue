<script>
import Vue from 'vue'
import { Notification, Button } from 'element-ui'
import order_mixin from '@/mixins/order_mixin'
import FormRow from '@/components/FormRow'
import AddressDisplay from '@/components/AddressDisplay'
import OrderCartItems from '@/components/order/OrderCartItems'

let currentNotification = null;

Vue.prototype.$notify = Notification;
Vue.use(Button);


function showNotification(Notification) {
    if(currentNotification) {
        currentNotification.close();
    }
    currentNotification = Notification
}


export default{
    middleware: 'authenticated',

    layout: 'admin',

    components: {
        FormRow,
        AddressDisplay,
        OrderCartItems
    },

    mixins: [
        order_mixin
    ],

    data() {
        return {
            modalIsActive: false,
            order: {
                transaction: {
                    creditCard: {},
                    shipping: {},
                    billing: {},
                },
                shoppingCart: {}
            }
        }
    },

    methods: {
        goToEdit() {
            this.$router.push({
                name: 'acts-product-upsert-id',
                params: { id: this.product.id }
            });
        }
    },

    async created() {
        try {
            this.order = await this.getOrder(this.$route.params.id);

            if(!this.order) {
                throw new Error(this.$t('Order not found'));
            }
        }
        catch(e) {
            showNotification(
                this.$notify({
                    type: 'error',
                    title: e.message,
                    duration: 0
                })
            );
        }
    }
}
</script>


<template>
    <div class="pal">

        <div class="tar mbl">
            <el-button type="primary"
                        @click="modalIsActive = true">VIEW JSON</el-button>
        </div>

        <!-- general info -->
        <div class="g-spec">
            <div class="g-spec-label">General Info</div>
            <div class="g-spec-content">

                <!-- id -->
                <form-row label="ID:">{{ order.id }}</form-row>

                <!-- Order date -->
                <form-row label="Ordered on:">{{ order.created_at | format8601 }}</form-row>

                <!-- transaction id -->
                <form-row label="Transaction ID:">{{ order.transaction_id }}</form-row>

                <!-- transaction id -->
                <form-row label="Success:">{{ order.success }}</form-row>

            </div>
        </div>

        <!-- shipping -->
        <div class="g-spec">
            <div class="g-spec-label">{{ $t('Shipping address') }}:</div>
            <div class="g-spec-content">
                <address-display
                    :first-name="order.transaction.shipping.firstName"
                    :last-name="order.transaction.shipping.lastName"
                    :street-address="order.transaction.shipping.streetAddress"
                    :extended-address="order.transaction.shipping.extendedAddress"
                    :company="order.transaction.shipping.company"
                    :country-code="order.transaction.shipping.countryCodeAlpha2"
                    :city="order.transaction.shipping.locality"
                    :state="order.transaction.shipping.region"
                    :zip="order.transaction.shipping.postalCode" />
            </div>
        </div>

        <!-- billing -->
        <div class="g-spec">
            <div class="g-spec-label">{{ $t('Billing address') }}:</div>
            <div class="g-spec-content">
                <address-display
                    :first-name="order.transaction.billing.firstName"
                    :last-name="order.transaction.billing.lastName"
                    :street-address="order.transaction.billing.streetAddress"
                    :extended-address="order.transaction.billing.extendedAddress"
                    :company="order.transaction.billing.company"
                    :country-code="order.transaction.billing.countryCodeAlpha2"
                    :city="order.transaction.billing.locality"
                    :state="order.transaction.billing.region"
                    :zip="order.transaction.billing.postalCode" />
            </div>
        </div>

        <!-- payment method -->
        <div class="g-spec">
            <div class="g-spec-label">{{ $t('Payment method') }}:</div>
            <div class="g-spec-content">
                <form-row label="Card number:">{{ order.transaction.creditCard.maskedNumber }}</form-row>
                <form-row label="Card type:">{{ order.transaction.creditCard.cardType }}</form-row>
                <form-row label="Expiration:">{{ order.transaction.creditCard.expirationDate }}</form-row>
            </div>
        </div>

        <!-- totals-->
        <div class="g-spec">
            <div class="g-spec-label">Totals:</div>
            <div class="g-spec-content">
                <form-row label="Subtotal:">
                    <div class="mono tar">{{ $n(order.shoppingCart.sub_total, 'currency') }}</div>
                </form-row>
                <form-row label="Shipping:">
                    <div class="mono tar">{{ $n(order.shoppingCart.shipping_total, 'currency') }}</div>
                </form-row>
                <form-row label="Estimated tax:">
                    <div class="mono tar">{{ $n(order.shoppingCart.sales_tax, 'currency') }}</div>
                </form-row>
                <form-row label="Order total:">
                    <div class="mono tar">{{ $n(order.shoppingCart.grand_total, 'currency') }}</div>
                </form-row>
            </div>
        </div>

        <!-- cart items-->
        <div class="g-spec">
            <div class="g-spec-label">Cart items ({{ order.shoppingCart.num_items }}):</div>
            <div class="g-spec-content">
                <order-cart-items :cart-items="order.shoppingCart.cart_items" />
            </div>
        </div>


        <el-dialog title="Product video"
                :visible.sync="modalIsActive"
                width="90%"
                top="5vh">
            <pre style="overflow-x:scroll">{{ order | formatJson }}</pre>
        </el-dialog>

    </div>
</template>
