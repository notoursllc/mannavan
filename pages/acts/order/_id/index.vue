<script>
import Vue from 'vue'
import { Notification, MessageBox, Button, Alert, Dialog } from 'element-ui'
import forEach from 'lodash.foreach';
import TreeView from 'vue-json-tree-view'
import payment_mixin from '@/mixins/payment_mixin'
import FormRow from '@/components/FormRow'
import AddressDisplay from '@/components/AddressDisplay'
import OrderCartItems from '@/components/order/OrderCartItems'
import ShippingLabelButton from '@/components/payment/ShippingLabelButton'

let currentNotification = null;

Vue.prototype.$confirm = MessageBox.confirm;
Vue.prototype.$notify = Notification;
Vue.use(Button);
Vue.use(Alert);
Vue.use(Dialog);
Vue.use(TreeView);


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
        OrderCartItems,
        ShippingLabelButton
    },

    mixins: [
        payment_mixin
    ],

    data() {
        return {
            showShippoWarning: false,
            modalIsActive: false,
            payment: {
                transaction: {
                    creditCard: {},
                    shipping: {},
                    billing: {},
                },
                shoppingCart: {
                    cart_items: [],
                    shipping_rate: {
                        servicelevel: {}
                    }
                }
            }
        }
    },

    methods: {
        async viewPackingSlip() {
            const response = await this.createPackingSlipFromPayment(this.payment.id);
            window.open(response.slip_url);
        },

        async loadPayment() {
            try {
                this.payment = await this.getPayment(this.$route.params.id);

                if(!this.payment) {
                    throw new Error(this.$t('Payment not found'));
                }

                if(!this.payment.shippo_order_id) {
                    this.showShippoWarning = true;
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
        },

        labelPurchased() {
            this.loadPayment();

            showNotification(
                this.$notify({
                    type: 'success',
                    title: "Shipping label purchased successfully",
                    duration: 4000
                })
            );
        },

        labelDeleted() {
            this.loadPayment();

            showNotification(
                this.$notify({
                    type: 'success',
                    title: "Shipping label deleted successfully",
                    duration: 4000
                })
            );
        }
    },

    created() {
        this.loadPayment();
    }
}
</script>


<template>
    <div class="pal">

        <!-- alert -->
        <div class="mbm" v-if="showShippoWarning">
            <el-alert
                title="A Shippo order has not yet been created for this payment"
                type="warning"
                :closable="false"
                show-icon>
            </el-alert>
        </div>

        <div class="tar mbl">
            <el-button type="primary"
                        @click="modalIsActive = true">VIEW JSON</el-button>
        </div>

        <!-- documents -->
        <div class="g-spec">
            <div class="g-spec-label">Documents</div>
            <div class="g-spec-content">
                <!-- Packing slip -->
                <form-row label="Packing slip:">
                    <el-button
                        size="mini"
                        @click="viewPackingSlip">{{ $t('View') }}</el-button>
                </form-row>

                <!-- Shipping Label -->
                <form-row label="Shipping Label:">
                    <shipping-label-button
                        :payment="payment"
                        @purchased="labelPurchased"
                        @deleted="labelDeleted" />
                </form-row>
            </div>
        </div>

        <!-- general info -->
        <div class="g-spec">
            <div class="g-spec-label">General Info</div>
            <div class="g-spec-content">
                <!-- Order date -->
                <form-row label="Ordered on:">{{ payment.created_at | format8601 }}</form-row>

                <!-- transaction id -->
                <form-row label="Transaction ID:">{{ payment.transaction.id }}</form-row>

                <!-- transaction id -->
                <form-row label="Success:">
                    <span v-bind:class="{'colorGreen':payment.transaction.success, 'colorRed':!payment.transaction.success}">
                        {{ payment.transaction.success ? 'Yes' : 'No '}}
                    </span>
                </form-row>
            </div>
        </div>

        <!-- Package -->
        <div class="g-spec">
            <div class="g-spec-label">{{ $t('Package') }}:</div>
            <div class="g-spec-content">
                <!-- product weight total -->
                <form-row label="Product weight total (oz):">{{ payment.shoppingCart.product_weight_total }}</form-row>

                <!-- postage quoted -->
                <form-row label="Postage quoted:">{{ $n(payment.shoppingCart.shipping_rate.amount, 'currency')  }}</form-row>

                <!-- provider -->
                <form-row label="Provider:">{{ payment.shoppingCart.shipping_rate.provider }}</form-row>

                <!-- service level -->
                <form-row label="Service level:">{{ payment.shoppingCart.shipping_rate.servicelevel.name  }}</form-row>

                <!-- shipping estimate-->
                <form-row label="Shipping estimate (days):">{{ payment.shoppingCart.shipping_rate.estimated_days  }}</form-row>
            </div>
        </div>

        <!-- shipping -->
        <div class="g-spec">
            <div class="g-spec-label">{{ $t('Shipping address') }}:</div>
            <div class="g-spec-content">
                <address-display
                    :first-name="payment.transaction.shipping.firstName"
                    :last-name="payment.transaction.shipping.lastName"
                    :street-address="payment.transaction.shipping.streetAddress"
                    :extended-address="payment.transaction.shipping.extendedAddress"
                    :company="payment.transaction.shipping.company"
                    :country-code="payment.transaction.shipping.countryCodeAlpha2"
                    :city="payment.transaction.shipping.locality"
                    :state="payment.transaction.shipping.region"
                    :zip="payment.transaction.shipping.postalCode" />
            </div>
        </div>

        <!-- cart items-->
        <div class="g-spec">
            <div class="g-spec-label">Cart items ({{ payment.shoppingCart.num_items }}):</div>
            <div class="g-spec-content">
                <order-cart-items :cart-items="payment.shoppingCart.cart_items" />
            </div>
        </div>

        <!-- totals-->
        <div class="g-spec">
            <div class="g-spec-label">Totals:</div>
            <div class="g-spec-content">
                <form-row label="Subtotal:">
                    <div class="mono tar">{{ $n(payment.shoppingCart.sub_total, 'currency') }}</div>
                </form-row>
                <form-row label="Shipping:">
                    <div class="mono tar">{{ $n(payment.shoppingCart.shipping_total, 'currency') }}</div>
                </form-row>
                <form-row label="Estimated tax:">
                    <div class="mono tar">{{ $n(payment.shoppingCart.sales_tax, 'currency') }}</div>
                </form-row>
                <form-row label="Order total:">
                    <div class="mono tar">{{ $n(payment.shoppingCart.grand_total, 'currency') }}</div>
                </form-row>
            </div>
        </div>

        <!-- payment method -->
        <div class="g-spec">
            <div class="g-spec-label">{{ $t('Payment method') }}:</div>
            <div class="g-spec-content">
                <form-row label="Card number:">{{ payment.transaction.creditCard.maskedNumber }}</form-row>
                <form-row label="Card type:">{{ payment.transaction.creditCard.cardType }}</form-row>
                <form-row label="Expiration:">{{ payment.transaction.creditCard.expirationDate }}</form-row>
            </div>
        </div>

        <!-- billing -->
        <div class="g-spec">
            <div class="g-spec-label">{{ $t('Billing address') }}:</div>
            <div class="g-spec-content">
                <address-display
                    :first-name="payment.transaction.billing.firstName"
                    :last-name="payment.transaction.billing.lastName"
                    :street-address="payment.transaction.billing.streetAddress"
                    :extended-address="payment.transaction.billing.extendedAddress"
                    :company="payment.transaction.billing.company"
                    :country-code="payment.transaction.billing.countryCodeAlpha2"
                    :city="payment.transaction.billing.locality"
                    :state="payment.transaction.billing.region"
                    :zip="payment.transaction.billing.postalCode" />
            </div>
        </div>

        <!-- json dialog -->
        <el-dialog title="Product video"
                :visible.sync="modalIsActive"
                width="90%"
                top="5vh">
            <tree-view :data="payment" :options="{maxDepth: 3}"></tree-view>
        </el-dialog>
    </div>
</template>

<style>
.parcel:nth-child(2n) {
    background-color: #f1f1f1;
}
</style>
