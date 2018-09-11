<script>
import Vue from 'vue'
import { Notification, MessageBox, Button, Input, InputNumber, Dialog } from 'element-ui'
import forEach from 'lodash.foreach';
import TreeView from 'vue-json-tree-view'
import payment_mixin from '@/mixins/payment_mixin'
import shipping_mixin from '@/mixins/shipping_mixin'
import FormRow from '@/components/FormRow'

let currentNotification = null;

Vue.prototype.$confirm = MessageBox.confirm;
Vue.prototype.$notify = Notification;
Vue.use(Button);
Vue.use(Dialog);
Vue.use(Input);
Vue.use(InputNumber);
Vue.use(TreeView);


function showNotification(Notification) {
    if(currentNotification) {
        currentNotification.close();
    }
    currentNotification = Notification
}


export default{
    props: {
        payment: {
            type: Object,
            // required: true
        },
    },

    components: {
        FormRow
    },

    mixins: [
        payment_mixin,
        shipping_mixin
    ],

    data() {
        return {
            showParcelCartItems: false,
            shippingLabelModalIsActive: false,
            shippingPackageTypes: [],
            labelForm: {
                shipment: {
                    address_to: {
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
                    address_from: {
                        company: null,
                        street1: null,
                        city: null,
                        state: null,
                        zip: null,
                        country: null,
                        email: null,
                        phone: null
                    },
                    parcels: []
                },
                carrier_account: null,
                servicelevel_token: null,
                label_file_type: 'PDF'
            }
        }
    },

    methods: {
        async viewShippingLabel() {
            const response = await this.getShippingLabel(this.payment.shippo_transaction_id);
            window.open(response.label_url);
        },

        async buyShippingLabel() {
            try {
                await this.$confirm('Purchase a shipping label from Shippo?', 'Please confirm', {
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                    type: 'warning'
                });

                this.shippingLabelModalIsActive = false;
                this.labelForm.id = this.payment.id

                const response = await this.purchaseShippingLabel(this.labelForm);

                this.$emit('purchased', response)
            }
            catch(err) {
                // DO NOTHING
            }
        },

        async buildParcelData() {
            let packageTypes = {};
            this.shippingPackageTypes = await this.getPackageTypes();

            this.payment.shoppingCart.cart_items.forEach((obj) => {
                let packageType = obj.product.shipping_package_type;

                let type = this.shippingPackageTypes.filter(typeObj => typeObj.type === packageType);

                if(type[0]) {
                    if(!packageTypes.hasOwnProperty(packageType)) {
                        packageTypes[packageType] = {
                            length: type[0].length,
                            width: type[0].width,
                            height: type[0].height,
                            distance_unit: "in",
                            weight: type[0].weight,
                            mass_unit: "oz"
                        }
                    }
                    else {
                        // Just adding weight to the existing package type
                        packageTypes[packageType].weight += type[0].weight;
                    }
                }
            });

            this.labelForm.shipment.parcels = [];
            forEach(packageTypes, (obj, key) => {
                this.labelForm.shipment.parcels.push(obj)
            });
        },


        addParcel() {
            this.labelForm.shipment.parcels.push({
                length: 0,
                width: 0,
                height: 0,
                distance_unit: "in",
                weight: 0,
                mass_unit: "oz"
            })
        },


        async removeParcel(index) {
            try {
                await this.$confirm(`Remove Parcel #${index + 1}?`, 'Please confirm', {
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                    type: 'warning'
                });

                this.labelForm.shipment.parcels.splice(index, 1);

                if(!this.labelForm.shipment.parcels.length) {
                    this.addParcel();
                }
            }
            catch(err) {
                // DO NOTHING
            }
        },


        async loadPayment() {
            try {
                this.buildParcelData();

                // Using the payment data to fill in the label purchase form:
                let cart = this.payment.shoppingCart;

                // Address To
                this.labelForm.shipment.address_to.name = `${cart.shipping_firstName}  ${cart.shipping_lastName}`;
                this.labelForm.shipment.address_to.company = cart.shipping_company;
                this.labelForm.shipment.address_to.street1 = cart.shipping_streetAddress;
                this.labelForm.shipment.address_to.street2 = cart.shipping_extendedAddress;
                this.labelForm.shipment.address_to.city = cart.shipping_city;
                this.labelForm.shipment.address_to.state = cart.shipping_state;
                this.labelForm.shipment.address_to.zip = cart.shipping_postalCode;
                this.labelForm.shipment.address_to.country = cart.shipping_countryCodeAlpha2;
                this.labelForm.shipment.address_to.email = cart.shipping_email;

                // Address From
                this.labelForm.shipment.address_from.company = process.env.SHIPPING_ADDRESS_FROM_COMPANY;
                this.labelForm.shipment.address_from.name = process.env.SHIPPING_ADDRESS_FROM_NAME;
                this.labelForm.shipment.address_from.street1 = process.env.SHIPPING_ADDRESS_FROM_ADDRESS1;
                this.labelForm.shipment.address_from.city = process.env.SHIPPING_ADDRESS_FROM_CITY;
                this.labelForm.shipment.address_from.state = process.env.SHIPPING_ADDRESS_FROM_STATE;
                this.labelForm.shipment.address_from.zip = process.env.SHIPPING_ADDRESS_FROM_ZIP;
                this.labelForm.shipment.address_from.country = process.env.SHIPPING_ADDRESS_FROM_COUNTRY_CODE;
                this.labelForm.shipment.address_from.phone = process.env.SHIPPING_ADDRESS_FROM_PHONE;
                this.labelForm.shipment.address_from.email = process.env.SHIPPING_ADDRESS_FROM_EMAIL;

                this.labelForm.carrier_account = cart.shipping_rate.carrier_account;
                this.labelForm.servicelevel_token = cart.shipping_rate.servicelevel.token;

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
    },

    created() {
        this.$watch('payment', val => {
            if(val) {
                this.loadPayment();
            }
        }, {immediate: true})
    }
}
</script>


<template>
    <div>
        <div v-if="payment && payment.id">
            <template v-if="payment.shippo_transaction_id">
                <el-button
                    size="mini"
                    @click="viewShippingLabel">{{ $t('View') }}</el-button>
            </template>
            <template v-else>
                <el-button
                    size="mini"
                    @click="shippingLabelModalIsActive = true">{{ $t('Create') }}</el-button>
            </template>
        </div>


        <el-dialog title="Create a shipping label"
                :visible.sync="shippingLabelModalIsActive"
                width="90%"
                top="5vh">

            <div class="g-spec">
                <div class="g-spec-label">To Address</div>
                <div class="g-spec-content">
                    <!-- Name -->
                    <form-row label="Name:">
                        <el-input v-model="labelForm.shipment.address_to.name"></el-input>
                    </form-row>

                    <!-- Company -->
                    <form-row label="Company:">
                        <el-input v-model="labelForm.shipment.address_to.company"></el-input>
                    </form-row>

                    <!-- Street 1 -->
                    <form-row label="Street 1:">
                        <el-input v-model="labelForm.shipment.address_to.street1"></el-input>
                    </form-row>

                    <!-- Street 2 -->
                    <form-row label="Street 2:">
                        <el-input v-model="labelForm.shipment.address_to.street2"></el-input>
                    </form-row>

                    <!-- City -->
                    <form-row label="City:">
                        <el-input v-model="labelForm.shipment.address_to.city"></el-input>
                    </form-row>

                    <!-- State -->
                    <form-row label="State:">
                        <el-input v-model="labelForm.shipment.address_to.state"></el-input>
                    </form-row>

                    <!-- Zip -->
                    <form-row label="Zip:">
                        <el-input v-model="labelForm.shipment.address_to.zip"></el-input>
                    </form-row>

                    <!-- Country -->
                    <form-row label="Country:">
                        <el-input v-model="labelForm.shipment.address_to.country"></el-input>
                    </form-row>

                    <!-- Email -->
                    <form-row label="Email:">
                        <el-input v-model="labelForm.shipment.address_to.email"></el-input>
                    </form-row>

                    <!-- Meta Data -->
                    <form-row label="Meta Data:">
                        <el-input type="textarea" :rows="1" v-model="labelForm.shipment.address_to.metadata"></el-input>
                    </form-row>
                </div>
            </div>

            <div class="g-spec">
                <div class="g-spec-label">From Address</div>
                <div class="g-spec-content">
                    <!-- Company -->
                    <form-row label="Company:">
                        <el-input v-model="labelForm.shipment.address_from.company"></el-input>
                    </form-row>

                    <!-- Name -->
                    <form-row label="Name:">
                        <el-input v-model="labelForm.shipment.address_from.name"></el-input>
                    </form-row>

                   <!-- Street 1 -->
                    <form-row label="Street 1:">
                        <el-input v-model="labelForm.shipment.address_from.street1"></el-input>
                    </form-row>

                    <!-- City -->
                    <form-row label="City:">
                        <el-input v-model="labelForm.shipment.address_from.city"></el-input>
                    </form-row>

                    <!-- State -->
                    <form-row label="State:">
                        <el-input v-model="labelForm.shipment.address_from.state"></el-input>
                    </form-row>

                    <!-- Zip -->
                    <form-row label="Zip:">
                        <el-input v-model="labelForm.shipment.address_from.zip"></el-input>
                    </form-row>

                    <!-- Country -->
                    <form-row label="Country:">
                        <el-input v-model="labelForm.shipment.address_from.country"></el-input>
                    </form-row>

                    <!-- Phone -->
                    <form-row label="Phone:">
                        <el-input v-model="labelForm.shipment.address_from.phone"></el-input>
                    </form-row>

                    <!-- Email -->
                    <form-row label="Email:">
                        <el-input v-model="labelForm.shipment.address_from.email"></el-input>
                    </form-row>
                </div>
            </div>

            <div class="g-spec">
                <div class="g-spec-label">Parcels</div>
                <div class="g-spec-content">
                    <div class="mbl">
                        <el-button @click="showParcelCartItems = !showParcelCartItems">TOGGLE CART ITEMS</el-button>
                        <el-button @click="addParcel">ADD PARCEL</el-button>
                    </div>

                    <div v-for="(obj, index) in labelForm.shipment.parcels"
                        :key="index"
                        class="parcel pam inlineBlock">
                        <div>
                            Parcel # {{ index + 1 }}:&nbsp;&nbsp;<a @click="removeParcel(index)">(remove)</a>
                        </div>
                        <div class="pam">
                            <!-- Length -->
                            <form-row label="Length:">
                                <el-input-number v-model="obj.length" controls-position="right"></el-input-number>
                            </form-row>

                            <!-- Width -->
                            <form-row label="Width:">
                                <el-input-number v-model="obj.width" controls-position="right"></el-input-number>
                            </form-row>

                            <!-- Height -->
                            <form-row label="Height (inches):">
                                <el-input-number v-model="obj.height" controls-position="right"></el-input-number>
                            </form-row>

                            <!-- Weight -->
                            <form-row label="Weight (oz):">
                                <el-input-number v-model="obj.weight" controls-position="right"></el-input-number>
                            </form-row>
                        </div>
                    </div>

                    <div v-if="showParcelCartItems" class="pam">
                        <tree-view :data="payment.shoppingCart.cart_items" :options="{maxDepth: 2}"></tree-view>
                    </div>
                </div>
            </div>

            <div class="g-spec">
                <div class="g-spec-label">Carrier</div>
                <div class="g-spec-content">
                    <!-- Carrier account -->
                    <form-row label="Carrier account:">
                        <el-input v-model="labelForm.carrier_account"></el-input>
                    </form-row>

                    <!-- Service level -->
                    <form-row label="Service level:">
                        <el-input v-model="labelForm.servicelevel_token"></el-input>
                    </form-row>
                </div>
            </div>

            <div class="g-spec">
                <div class="g-spec-label"></div>
                <div class="g-spec-content">
                    <el-button type="primary" @click="buyShippingLabel">PURCHASE SHIPPING LABEL</el-button>
                </div>
            </div>
        </el-dialog>

    </div>
</template>


<style scoped>
.parcel:nth-child(2n) {
    background-color: #f1f1f1;
}
</style>
