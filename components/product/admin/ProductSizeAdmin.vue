<script>
import Vue from 'vue'
import { Notification, MessageBox, Dialog, Button, Input, InputNumber, Checkbox, Select, Option, Table, TableColumn } from 'element-ui'
import FormRow from '@/components/FormRow'
import IconPencil from '@/components/icons/IconPencil'
import IconTrash from '@/components/icons/IconTrash'
import IconCheckSquare from '@/components/icons/IconCheckSquare'
import product_mixin from '@/mixins/product_mixin'

Vue.prototype.$notify = Notification;
Vue.prototype.$confirm = MessageBox.confirm;

Vue.use(Button);
Vue.use(Dialog);
Vue.use(Input);
Vue.use(InputNumber);
Vue.use(Checkbox);
Vue.use(Select);
Vue.use(Option);
Vue.use(Table);
Vue.use(TableColumn);

let currentNotification = null;


function showNotification(Notification) {
    if(currentNotification) {
        currentNotification.close();
    }
    currentNotification = Notification
}


export default {
    components: {
        FormRow,
        IconTrash,
        IconPencil,
        IconCheckSquare
    },

    props: {
        productId: {
            type: String,
            required: false
        }
    },

    mixins: [
        product_mixin
    ],

    data() {
        return {
            product: {},
            sizeOptions: {},
            sizeModal: {
                isActive: false,
                size: {}
            }
        }
    },

    computed: {
        productSizes() {
            return this.product.sizes;
        }
    },

    methods: {
        resetSizeModalData() {
            this.sizeModal.isActive = false;
            this.sizeModal.size = {};
        },


        openSizeUpsertModal(size) {
            this.setSizeOptions(this.product.sizes);
            this.sizeModal.size = size || {};
            this.sizeModal.isActive = true;
        },

        async getProduct() {
            if(!this.productId) {
                return;
            }

            try {
                this.product = await this.getProductById(this.productId, { viewAllRelated: true });

                if(!this.product) {
                    throw new Error(this.$t('Product not found'));
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


        async setSizeOptions(sizes) {
            try {
                this.sizeOptions = await this.buildMissingSizeOptions(sizes);
            }
            catch(err) {
                showNotification(
                    this.$notify({
                        type: 'error',
                        title: e.message,
                        duration: 0
                    })
                )
            }
        },


        async deleteSize(sizeObject) {
            let sizeName = this.$t(sizeObject.size);

            try {
                await this.$confirm(`Remove size "${ sizeName }" from the product?`, 'Please confirm', {
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                    type: 'warning'
                });

                try {
                    let size = await this.deleteProductSize(sizeObject.id);

                    if(!size) {
                        throw new Error(this.$t('Product size not found'));
                    }

                    this.getProduct();

                    showNotification(
                        this.$notify({
                            type: 'success',
                            title: 'Size deleted:',
                            message: sizeName,
                            duration: 4000
                        })
                    );
                }
                catch(e) {
                    showNotification(
                        this.$notify({
                            type: 'error',
                            title: e.message,
                            duration: 0
                        })
                    )
                }
            }
            catch(err) {
                // do nothing when user cancels the size delete
            }
        },


        async saveSize(size) {
            size.product_id = this.product.id;

            try {
                let sizeJson = await this.upsertProductSize(size);

                this.resetSizeModalData();
                this.getProduct();

                showNotification(
                    this.$notify({
                        type: 'success',
                        title: 'Size updated:',
                        message: this.$t(sizeJson.size),
                        duration: 4000
                    })
                )
            }
            catch(e) {
                showNotification(
                    this.$notify({
                        type: 'error',
                        title: e.message,
                        duration: 0
                    })
                )
            }
        }
    },

    mounted() {
        const unwatch = this.$watch('productId', val => {
            if(val) {
                this.getProduct();
                unwatch();
            }
        }, {immediate: true})
    }
}
</script>


<template>
    <div v-cloak>
        <div class="tar mbm">
            <el-button type="primary" @click="openSizeUpsertModal()">ADD SIZE</el-button>
        </div>

        <!-- <div v-if="!sizes || !sizes.length" class="colorGrayLighter">none</div> -->
        <div v-if="!product.sizes || !product.sizes.length" class="colorGrayLighter">none</div>
        <div v-else>
            <div class="colorGrayLighter fs14 mbs">{{ `${product.sizes.length} ${$tc('results', product.sizes.length)}` }}</div>

            <el-table
                :data="product.sizes"
                class="widthAll">

                <!-- size name -->
                <el-table-column prop="size" label="Size">
                    <template slot-scope="scope">{{ $t(scope.row.size) }}</template>
                </el-table-column>

                <!-- operations -->
                <el-table-column
                    label="Operations"
                    align="center"
                    width="150">
                    <div slot-scope="scope" class="nowrap">
                        <el-button
                            type="primary"
                            round
                            @click="openSizeUpsertModal(scope.row)">
                            <icon-pencil
                                icon-name="edit"
                                class-name="fillWhite"
                                width="15px" />
                        </el-button>

                        <el-button
                            type="danger"
                            round
                            @click="deleteSize(scope.row)"
                            class="mrl">
                            <icon-trash
                                icon-name="delete"
                                class-name="fillWhite"
                                width="15px" />
                        </el-button>
                    </div>
                </el-table-column>

                <!-- is visible -->
                <el-table-column
                    prop="is_visible"
                    label="Is visible"
                    align="right">
                    <template slot-scope="scope">
                        <icon-check-square
                            v-if="scope.row.is_visible"
                            icon-name="checked"
                            class-name="fillGreen"
                            width="15px" />
                    </template>
                </el-table-column>

                <!-- cost -->
                <el-table-column
                    prop="cost"
                    label="Cost"
                    align="right"></el-table-column>

                <!-- base price -->
                <el-table-column
                    prop="base_price"
                    label="Base price"
                    align="right">
                </el-table-column>

                <!-- sale price -->
                <el-table-column
                    prop="sale_price"
                    label="Sale price"
                    align="right"></el-table-column>

                <!-- is on sale -->
                <el-table-column
                    prop="is_visible"
                    label="Is on sale"
                    align="right">
                    <template slot-scope="scope">
                        <icon-check-square
                            v-if="scope.row.is_on_sale"
                            icon-name="checked"
                            class-name="fillGreen"
                            width="15px" />
                    </template>
                </el-table-column>

                <!-- inventory count -->
                <el-table-column
                    prop="inventory_count"
                    label="Inventory count"
                    align="right">
                </el-table-column>
            </el-table>
        </div>

        <!-- product size edit dialog -->
        <el-dialog :title="sizeModal.size.size ? 'EDIT: ' + $t(sizeModal.size.size) : 'ADD SIZE'"
                   :visible.sync="sizeModal.isActive"
                   :modal-append-to-body="false">

            <form-row label="Size:">
                <div v-if="sizeModal.size.size">{{ $t(sizeModal.size.size) }}</div>
                <el-select
                    v-else
                    v-model="sizeModal.size.size"
                    placeholder="Choose">
                    <el-option
                        v-for="key in sizeOptions"
                        :key="key"
                        :label="$tc(key, 2)"
                        :value="key">
                    </el-option>
                </el-select>
            </form-row>

            <form-row label="Is visible:">
                <el-checkbox v-model="sizeModal.size.is_visible"></el-checkbox>
            </form-row>

            <form-row label="Cost:">
                <el-input-number v-model="sizeModal.size.cost" controls-position="right" :step=".01"></el-input-number>
            </form-row>

            <form-row label="Base price:">
                <el-input-number v-model="sizeModal.size.base_price" controls-position="right" :step=".01"></el-input-number>
            </form-row>

            <form-row label="Sale price:">
                <el-input-number v-model="sizeModal.size.sale_price" controls-position="right" :step=".01"></el-input-number>
            </form-row>

            <form-row label="Is on sale:">
                <el-checkbox v-model="sizeModal.size.is_on_sale"></el-checkbox>
            </form-row>

            <form-row label="Inventory count:">
                <el-input-number v-model="sizeModal.size.inventory_count" controls-position="right" :step="1"></el-input-number>
            </form-row>

            <form-row label="">
                <div class="ptl">
                    <el-button type="primary" class="mrm" @click="saveSize(sizeModal.size)">SAVE</el-button>
                    <el-button @click="resetSizeModalData()">CANCEL</el-button>
                </div>
            </form-row>
        </el-dialog>
    </div>
</template>
