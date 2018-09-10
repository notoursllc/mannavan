<script>
import Vue from 'vue'
import { Notification, MessageBox, Button, Input, InputNumber, Alert, Dialog } from 'element-ui'
import payment_mixin from '@/mixins/payment_mixin'
import shipping_mixin from '@/mixins/shipping_mixin'
import shopping_cart_mixin from '@/mixins/shopping_cart_mixin'
import FormRow from '@/components/FormRow'
import AddressDisplay from '@/components/AddressDisplay'
import OrderCartItems from '@/components/order/OrderCartItems'

let currentNotification = null;

Vue.prototype.$confirm = MessageBox.confirm;
Vue.prototype.$notify = Notification;
Vue.use(Button);
Vue.use(Alert);
Vue.use(Dialog);


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
        payment_mixin,
        shipping_mixin,
        shopping_cart_mixin,
        payment_mixin
    ],

    data() {
        return {
            showShippoWarning: false,
            modalIsActive: false,
            shippingLabelModalIsActive: false,
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
            },
            labelForm: {
                addressTo: {
                    name: null,
                    company: null,
                    street1: null,
                    street2: null,
                    city: null,
                    state: null,
                    zip: null,
                    country: null,
                    email: null,
                    metadata: null
                },
                addressFrom: {
                    company: null,
                    street1: null,
                    city: null,
                    state: null,
                    zip: null,
                    country: null,
                    email: null,
                    phone: null
                }

            }
        }
    },

    methods: {
        goToEdit() {
            this.$router.push({
                name: 'acts-product-upsert-id',
                params: { id: this.product.id }
            });
        },

        async viewPackingSlip() {
            const response = await this.createPackingSlipFromPayment(this.payment.id);
            window.open(response.slip_url);
        },

        async viewShippingLabel() {
            const response = await this.getShippingLabelFromPayment(this.payment.id);
            window.open(response.slip_url);
        },

        async purchaseShippingLabel() {
            try {
                await this.$confirm('Purchase a shipping label from Shippo?', 'Please confirm', {
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                    type: 'warning'
                });

                const response = await this.purchaseShippingLabelFromPayment(this.payment.id);
                window.open(response.slip_url);
            }
            catch(err) {
                // DO NOTHING
            }
        },

        buildShippingLabel() {
            this.shippingLabelModalIsActive = true;
        }
    },

    async created() {
        try {
            this.payment = await this.getPayment(this.$route.params.id);

            if(!this.payment) {
                throw new Error(this.$t('Payment not found'));
            }

            if(!this.payment.shippo_order_id) {
                this.showShippoWarning = true;
            }

            // Using the payment data to fill in the label purchase form:
            let cart = this.payment.shoppingCart;

            // Address To
            this.labelForm.addressTo.name = `${cart.shipping_firstName}  ${cart.shipping_lastName}`;
            this.labelForm.addressTo.company = cart.shipping_company;
            this.labelForm.addressTo.street1 = cart.shipping_streetAddress;
            this.labelForm.addressTo.street2 = cart.shipping_extendedAddress;
            this.labelForm.addressTo.city = cart.shipping_city;
            this.labelForm.addressTo.state = cart.shipping_state;
            this.labelForm.addressTo.zip = cart.shipping_postalCode;
            this.labelForm.addressTo.country = cart.shipping_countryCodeAlpha2;
            this.labelForm.addressTo.email = cart.shipping_email;

            // Address From
            // this.labelForm.addressFrom.name = process.env.SHIPPING_ADDRESS_FROM_NAME;
            this.labelForm.addressFrom.company = process.env.SHIPPING_ADDRESS_FROM_NAME;
            this.labelForm.addressFrom.street1 = process.env.SHIPPING_ADDRESS_FROM_ADDRESS1;
            this.labelForm.addressFrom.city = process.env.SHIPPING_ADDRESS_FROM_CITY;
            this.labelForm.addressFrom.state = process.env.SHIPPING_ADDRESS_FROM_STATE;
            this.labelForm.addressFrom.zip = process.env.SHIPPING_ADDRESS_FROM_ZIP;
            this.labelForm.addressFrom.country = process.env.SHIPPING_ADDRESS_FROM_COUNTRY_CODE;
            this.labelForm.addressFrom.phone = process.env.SHIPPING_ADDRESS_FROM_PHONE;
            this.labelForm.addressFrom.email = process.env.SHIPPING_ADDRESS_FROM_EMAIL;

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
                    <template v-if="this.payment.shippo_transaction_id">
                        <el-button
                            size="mini"
                            @click="buildShippingLabel">{{ $t('View') }}</el-button>
                    </template>
                    <template v-else>
                        <el-button
                            size="mini"
                            @click="buildShippingLabel">{{ $t('Create') }}</el-button>
                    </template>
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
            <pre style="overflow-x:scroll">{{ payment | formatJson }}</pre>
        </el-dialog>

        <!-- shipping label builder dialog -->
        <el-dialog title="Create a shipping label"
                :visible.sync="shippingLabelModalIsActive"
                width="90%"
                top="5vh">

            <div class="g-spec">
                <div class="g-spec-label">To Address</div>
                <div class="g-spec-content">
                    <!-- Name -->
                    <form-row label="Name:">
                        <el-input v-model="labelForm.addressTo.name"></el-input>
                    </form-row>

                    <!-- Company -->
                    <form-row label="Company:">
                        <el-input v-model="labelForm.addressTo.company"></el-input>
                    </form-row>

                    <!-- Street 1 -->
                    <form-row label="Street 1:">
                        <el-input v-model="labelForm.addressTo.street1"></el-input>
                    </form-row>

                    <!-- Street 2 -->
                    <form-row label="Street 2:">
                        <el-input v-model="labelForm.addressTo.street2"></el-input>
                    </form-row>

                    <!-- City -->
                    <form-row label="City:">
                        <el-input v-model="labelForm.addressTo.city"></el-input>
                    </form-row>

                    <!-- State -->
                    <form-row label="State:">
                        <el-input v-model="labelForm.addressTo.state"></el-input>
                    </form-row>

                    <!-- Zip -->
                    <form-row label="Zip:">
                        <el-input v-model="labelForm.addressTo.zip"></el-input>
                    </form-row>

                    <!-- Country -->
                    <form-row label="Country:">
                        <el-input v-model="labelForm.addressTo.country"></el-input>
                    </form-row>

                    <!-- Email -->
                    <form-row label="Email:">
                        <el-input v-model="labelForm.addressTo.email"></el-input>
                    </form-row>

                    <!-- Meta Data -->
                    <form-row label="Meta Data:">
                        <el-input type="textarea" :rows="1" v-model="labelForm.addressTo.metadata"></el-input>
                    </form-row>
                </div>
            </div>

            <div class="g-spec">
                <div class="g-spec-label">From Address</div>
                <div class="g-spec-content">
                    <!-- Company -->
                    <form-row label="Name:">
                        <el-input v-model="labelForm.addressFrom.company"></el-input>
                    </form-row>

                   <!-- Street 1 -->
                    <form-row label="Street 1:">
                        <el-input v-model="labelForm.addressFrom.street1"></el-input>
                    </form-row>

                    <!-- City -->
                    <form-row label="City:">
                        <el-input v-model="labelForm.addressFrom.city"></el-input>
                    </form-row>

                    <!-- State -->
                    <form-row label="State:">
                        <el-input v-model="labelForm.addressFrom.state"></el-input>
                    </form-row>

                    <!-- Zip -->
                    <form-row label="Zip:">
                        <el-input v-model="labelForm.addressFrom.zip"></el-input>
                    </form-row>

                    <!-- Country -->
                    <form-row label="Country:">
                        <el-input v-model="labelForm.addressFrom.country"></el-input>
                    </form-row>

                    <!-- Phone -->
                    <form-row label="Phone:">
                        <el-input v-model="labelForm.addressFrom.phone"></el-input>
                    </form-row>

                    <!-- Email -->
                    <form-row label="Email:">
                        <el-input v-model="labelForm.addressFrom.email"></el-input>
                    </form-row>
                </div>
            </div>

            <div class="g-spec">
                <div class="g-spec-label">Parcels</div>
                <div class="g-spec-content">
                </div>
            </div>
        </el-dialog>

    </div>
</template>
