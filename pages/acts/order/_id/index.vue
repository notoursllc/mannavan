<script>
import Vue from 'vue'
import forEach from 'lodash.foreach';
import TreeView from 'vue-json-tree-view'
import payment_mixin from '@/mixins/payment_mixin'

Vue.use(TreeView);


export default{
    middleware: 'authenticated',

    layout: 'admin',

    components: {
        AddressDisplay: () => import('@/components/AddressDisplay'),
        ShippingLabelButton: () => import('@/components/payment/ShippingLabelButton'),
        CartItems: () => import('@/components/cart/CartItems')
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

                console.log("PAYMENT", this.payment)
            }
            catch(e) {
                this.$errorMessage(
                    e.message,
                    { closeOthers: true }
                )
            }
        },

        labelPurchased() {
            this.loadPayment();
            this.$successMessage('Shipping label purchased successfully');
        },

        labelDeleted() {
            this.loadPayment();
            this.$successMessage('Shipping label deleted successfully');
        }
    },

    created() {
        this.loadPayment();
    }
}
</script>


<template>
    <div>
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
                <div class="formRow">
                    <label>Packing slip:</label>
                    <span>
                        <el-button
                            size="mini"
                            @click="viewPackingSlip">{{ $t('View') }}</el-button>
                    </span>
                </div>

                <!-- Shipping Label -->
                <div class="formRow">
                    <label>Shipping Label:</label>
                    <span>
                        <shipping-label-button
                            :payment="payment"
                            @purchased="labelPurchased"
                            @deleted="labelDeleted" />
                    </span>
                </div>
            </div>
        </div>

        <!-- general info -->
        <div class="g-spec">
            <div class="g-spec-label">General Info</div>
            <div class="g-spec-content">
                <!-- Order date -->
                <div class="formRow">
                    <label>Ordered on:</label>
                    <span>{{ payment.created_at | format8601 }}</span>
                </div>

                <!-- transaction id -->
                <div class="formRow">
                    <label>Transaction ID:</label>
                    <span>{{ payment.transaction.id }}</span>
                </div>

                <!-- transaction id -->
                <div class="formRow">
                    <label>Success:</label>
                    <span>
                        <div v-for="obj in payment.transaction.tenders" :key="obj.id">
                            {{ obj.card_details.status }}
                        </div>
                    </span>
                </div>
            </div>
        </div>

        <!-- cart items-->
        <div class="g-spec">
            <div class="g-spec-label">Cart items ({{ payment.shoppingCart.num_items }}):</div>
            <div class="g-spec-content">
                <cart-items
                    :shopping-cart="payment.shoppingCart"
                    :allow-edit="false" />
            </div>
        </div>

        <!-- totals-->
        <div class="g-spec">
            <div class="g-spec-label">Totals:</div>
            <div class="g-spec-content">
                <div class="formRow">
                    <label>Subtotal:</label>
                    <span class="mono tar">{{ $n(payment.shoppingCart.sub_total, 'currency') }}</span>
                </div>

                <div class="formRow">
                    <label>Shipping:</label>
                    <span class="mono tar">{{ $n(payment.shoppingCart.shipping_total, 'currency') }}</span>
                </div>

                <div class="formRow">
                    <label>Estimated tax:</label>
                    <span class="mono tar">{{ $n(payment.shoppingCart.sales_tax, 'currency') }}</span>
                </div>

                <div class="formRow">
                    <label>Order total:</label>
                    <span class="mono tar">{{ $n(payment.shoppingCart.grand_total, 'currency') }}</span>
                </div>
            </div>
        </div>

        <!-- Package -->
        <div class="g-spec">
            <div class="g-spec-label">{{ $t('Package') }}:</div>
            <div class="g-spec-content">
                <!-- product weight total -->
                <div class="formRow">
                    <label>Product weight total (oz):</label>
                    <span>{{ payment.shoppingCart.product_weight_total }}</span>
                </div>

                <!-- postage quoted -->
                <div class="formRow">
                    <label>Postage quoted:</label>
                    <span>{{ $n(payment.shoppingCart.shipping_rate.amount, 'currency') }}</span>
                </div>

                <!-- provider -->
                <div class="formRow">
                    <label>Provider:</label>
                    <span>{{ payment.shoppingCart.shipping_rate.provider }}</span>
                </div>

                <!-- service level -->
                <div class="formRow">
                    <label>Service level:</label>
                    <span>{{ payment.shoppingCart.shipping_rate.servicelevel.name }}</span>
                </div>

                <!-- shipping estimate-->
                <div class="formRow">
                    <label>Shipping estimate (days):</label>
                    <span>{{ payment.shoppingCart.shipping_rate.estimated_days }}</span>
                </div>
            </div>
        </div>

        <!-- shipping -->
        <div class="g-spec">
            <div class="g-spec-label">{{ $t('Shipping address') }}:</div>
            <div class="g-spec-content">
                <address-display
                    :first-name="payment.shoppingCart.shipping_firstName"
                    :last-name="payment.shoppingCart.shipping_lastName"
                    :street-address="payment.shoppingCart.shipping_streetAddress"
                    :extended-address="payment.shoppingCart.shipping_extendedAddress"
                    :company="payment.shoppingCart.shipping_company"
                    :country-code="payment.shoppingCart.shipping_countryCodeAlpha2"
                    :city="payment.shoppingCart.shipping_city"
                    :state="payment.shoppingCart.shipping_state"
                    :zip="payment.shoppingCart.shipping_postalCode" />
            </div>
        </div>

        <!-- billing -->
        <div class="g-spec">
            <div class="g-spec-label">{{ $t('Billing address') }}:</div>
            <div class="g-spec-content">
                <address-display
                    :first-name="payment.shoppingCart.billing_firstName"
                    :last-name="payment.shoppingCart.billing_lastName"
                    :street-address="payment.shoppingCart.billing_streetAddress"
                    :extended-address="payment.shoppingCart.billing_extendedAddress"
                    :company="payment.shoppingCart.billing_company"
                    :country-code="payment.shoppingCart.billing_countryCodeAlpha2"
                    :city="payment.shoppingCart.billing_city"
                    :state="payment.shoppingCart.billing_state"
                    :zip="payment.shoppingCart.billing_postalCode" />
            </div>
        </div>


        <!-- payment method -->
        <div class="g-spec">
            <div class="g-spec-label">{{ $t('Payment method') }}:</div>
            <div class="g-spec-content">
                <div class="formRow">
                    <label>Card number:</label>
                    <span>
                        <div v-for="obj in payment.transaction.tenders" :key="obj.id">
                            {{ obj.card_details.card.last_4 }}
                        </div>
                    </span>
                </div>

                <div class="formRow">
                    <label>Card type:</label>
                    <span>
                        <div v-for="obj in payment.transaction.tenders" :key="obj.id">
                            {{ obj.card_details.card.card_brand }}
                        </div>
                    </span>
                </div>
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


<style lang="scss">
@import "~assets/css/components/_formRow.scss";

.parcel:nth-child(2n) {
    background-color: #f1f1f1;
}
</style>
