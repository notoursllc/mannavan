<script>
import Vue from 'vue'
import forEach from 'lodash.foreach';
import TreeView from 'vue-json-tree-view'
import payment_mixin from '@/mixins/payment_mixin'
import shipping_mixin from '@/mixins/shipping_mixin'

Vue.use(TreeView);

export default{
    props: {
        payment: {
            type: Object,
            // required: true
        },
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


        async deleteShippingLabel() {
            try {
                await this.$confirm('Delete this shipping label?', 'Please confirm', {
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                    type: 'warning'
                });

                await this.deleteShippingLabelForPayment(this.payment.id);

                this.$emit('deleted', this.payment.id);
            }
            catch(err) {
                // DO NOTHING
            }
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
            this.shippingPackageTypes = await this.shipmix_getPackageTypes();

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
                this.labelForm.shipment.address_from.company = this.$config.shippingFromCompany;
                this.labelForm.shipment.address_from.name = this.$config.domainName;
                this.labelForm.shipment.address_from.street1 = this.$config.shippingFromAddress1;
                this.labelForm.shipment.address_from.city = this.$config.shippingFromCity;
                this.labelForm.shipment.address_from.state = this.$config.shippingFromState;
                this.labelForm.shipment.address_from.zip = this.$config.shippingFromZip;
                this.labelForm.shipment.address_from.country = this.$config.shippingFromCountryCode;
                this.labelForm.shipment.address_from.phone = this.$config.shippingFromPhone;
                this.labelForm.shipment.address_from.email = this.$config.emailInfo;

                this.labelForm.carrier_account = cart.shipping_rate.carrier_account;
                this.labelForm.servicelevel_token = cart.shipping_rate.servicelevel.token;

            }
            catch(err) {
                this.$errorMessage(
                    err.message,
                    { closeOthers: true }
                );

                this.$bugsnag.notify(err);
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

                <el-button
                    size="mini"
                    type="danger"
                    @click="deleteShippingLabel">{{ $t('Delete') }}</el-button>
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
                    <div class="formRow">
                        <label>Name:</label>
                        <span>
                            <el-input v-model="labelForm.shipment.address_to.name" />
                        </span>
                    </div>

                    <!-- Company -->
                    <div class="formRow">
                        <label>Company:</label>
                        <span>
                            <el-input v-model="labelForm.shipment.address_to.company" />
                        </span>
                    </div>

                    <!-- Street 1 -->
                    <div class="formRow">
                        <label>Street 1:</label>
                        <span>
                            <el-input v-model="labelForm.shipment.address_to.street1" />
                        </span>
                    </div>

                    <!-- Street 2 -->
                    <div class="formRow">
                        <label>Street 2:</label>
                        <span>
                            <el-input v-model="labelForm.shipment.address_to.street2" />
                        </span>
                    </div>

                    <!-- City -->
                    <div class="formRow">
                        <label>City:</label>
                        <span>
                            <el-input v-model="labelForm.shipment.address_to.city" />
                        </span>
                    </div>

                    <!-- State -->
                    <div class="formRow">
                        <label>State:</label>
                        <span>
                            <el-input v-model="labelForm.shipment.address_to.state" />
                        </span>
                    </div>

                    <!-- Zip -->
                    <div class="formRow">
                        <label>Zip:</label>
                        <span>
                            <el-input v-model="labelForm.shipment.address_to.zip" />
                        </span>
                    </div>

                    <!-- Country -->
                    <div class="formRow">
                        <label>Country:</label>
                        <span>
                            <el-input v-model="labelForm.shipment.address_to.country" />
                        </span>
                    </div>

                    <!-- Email -->
                    <div class="formRow">
                        <label>Email:</label>
                        <span>
                            <el-input v-model="labelForm.shipment.address_to.email" />
                        </span>
                    </div>

                    <!-- Meta Data -->
                    <div class="formRow">
                        <label>Meta Data:</label>
                        <span>
                            <el-input
                                type="textarea"
                                :rows="1"
                                v-model="labelForm.shipment.address_to.metadata" />
                        </span>
                    </div>
                </div>
            </div>

            <div class="g-spec">
                <div class="g-spec-label">From Address</div>
                <div class="g-spec-content">
                    <!-- Company -->
                    <div class="formRow">
                        <label>Company:</label>
                        <span>
                            <el-input v-model="labelForm.shipment.address_from.company" />
                        </span>
                    </div>

                    <!-- Name -->
                    <div class="formRow">
                        <label>Name:</label>
                        <span>
                            <el-input v-model="labelForm.shipment.address_from.name" />
                        </span>
                    </div>

                   <!-- Street 1 -->
                    <div class="formRow">
                        <label>Street 1:</label>
                        <span>
                            <el-input v-model="labelForm.shipment.address_from.street1" />
                        </span>
                    </div>

                    <!-- City -->
                    <div class="formRow">
                        <label>City:</label>
                        <span>
                            <el-input v-model="labelForm.shipment.address_from.city" />
                        </span>
                    </div>

                    <!-- State -->
                    <div class="formRow">
                        <label>State:</label>
                        <span>
                            <el-input v-model="labelForm.shipment.address_from.state" />
                        </span>
                    </div>

                    <!-- Zip -->
                    <div class="formRow">
                        <label>Zip:</label>
                        <span>
                            <el-input v-model="labelForm.shipment.address_from.zip" />
                        </span>
                    </div>

                    <!-- Country -->
                    <div class="formRow">
                        <label>Country:</label>
                        <span>
                            <el-input v-model="labelForm.shipment.address_from.country" />
                        </span>
                    </div>

                    <!-- Phone -->
                    <div class="formRow">
                        <label>Phone:</label>
                        <span>
                            <el-input v-model="labelForm.shipment.address_from.phone" />
                        </span>
                    </div>

                    <!-- Email -->
                    <div class="formRow">
                        <label>Email:</label>
                        <span>
                            <el-input v-model="labelForm.shipment.address_from.email" />
                        </span>
                    </div>
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
                            <div class="formRow">
                                <label>Length:</label>
                                <span>
                                    <el-input-number
                                        v-model="obj.length"
                                        controls-position="right" />
                                </span>
                            </div>

                            <!-- Width -->
                            <div class="formRow">
                                <label>Width:</label>
                                <span>
                                    <el-input-number
                                        v-model="obj.width"
                                        controls-position="right" />
                                </span>
                            </div>

                            <!-- Height -->
                            <div class="formRow">
                                <label>Height (inches):</label>
                                <span>
                                    <el-input-number
                                        v-model="obj.height"
                                        controls-position="right" />
                                </span>
                            </div>

                            <!-- Weight -->
                            <div class="formRow">
                                <label>Weight (oz):</label>
                                <span>
                                    <el-input-number
                                        v-model="obj.weight"
                                        controls-position="right" />
                                </span>
                            </div>
                        </div>
                    </div>

                    <div v-if="showParcelCartItems" class="pam">
                        <tree-view
                            :data="payment.shoppingCart.cart_items"
                            :options="{maxDepth: 2}" />
                    </div>
                </div>
            </div>

            <div class="g-spec">
                <div class="g-spec-label">Carrier</div>
                <div class="g-spec-content">
                    <!-- Carrier account -->
                    <div class="formRow">
                        <label>Carrier account:</label>
                        <span>
                            <el-input v-model="labelForm.carrier_account" />
                        </span>
                    </div>

                    <!-- Service level -->
                    <div class="formRow">
                        <label>Service level:</label>
                        <span>
                            <el-input v-model="labelForm.servicelevel_token" />
                        </span>
                    </div>
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


<style lang="scss" scoped>
@import "~assets/css/components/_formRow.scss";

.parcel:nth-child(2n) {
    background-color: #f1f1f1;
}
</style>
