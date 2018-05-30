<script>
import Vue from 'vue'
import cloneDeep from 'lodash.clonedeep'
import forEach from 'lodash.foreach'
import { Notification, MessageBox, Dialog, Button, Input, InputNumber, Checkbox, Select, Option } from 'element-ui'
import FormRow from '@/components/FormRow'
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

let currentNotification = null;


function showNotification(Notification) {
    if(currentNotification) {
        currentNotification.close();
    }
    currentNotification = Notification
}


export default{
    components: {
        FormRow
    },

    props: {
        // productId: {
        //     type: String,
        //     required: false
        // },
        product: {
            type: Object,
            required: false
        }
        // sizes: {
        //     type: Array,
        //     required: false
        // }
    },

    mixins: [
        product_mixin
    ],

    data() {
        return {
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
        // setSizesPropertyInProduct() {
        //     if(!this.product) {
        //         this.product = {};
        //     }
        //     if(!this.product.hasOwnProperty('sizes')) {
        //         this.product.sizes = [];
        //     }
        // },

        // setSizesProp() {
        //     if(!Array.isArray(this.sizes)) {
        //         this.sizes = [];
        //     }
        // },

        resetSizeModalData() {
            this.sizeModal.isActive = false;
            this.sizeModal.size = {};
        },


        setSizeOptions(sizes) {
            this.buildMissingSizeOptions(sizes)
                .then((options) => {
                    this.sizeOptions = options;
                })
                .catch((e) => {
                    showNotification(
                        this.$notify({
                            type: 'error',
                            title: e.message,
                            duration: 0
                        })
                    )
                });
        },


        openSizeEditModal(size) {
            // this.setSizeOptions(this.sizes);
            this.setSizeOptions(this.product.sizes);
            this.sizeModal.size = size || {};
            this.sizeModal.isActive = true;
        },


        deleteSize(size) {
            // this.setSizesProp();

            // let sizes = cloneDeep(this.product.sizes);

            if(size.size) {
                let productSizeIndex = -1;

                // this.sizes.forEach((obj, index) => {
                this.product.sizes.forEach((obj, index) => {
                    if(obj.size === size.size) {
                        productSizeIndex = index;
                    }
                });

                console.log("DELETING INDEX", productSizeIndex)

                if(productSizeIndex > -1) {
                    // this.sizes.splice(productSizeIndex, 1);
                    this.product.sizes.splice(productSizeIndex, 1);
                    // this.$emit('updated', sizes);
                }
            }
        },

        // deleteSize(size) {
        //     let sizeName = this.$t(size.size);

        //     this.$confirm(`Remove size "${ sizeName }" from the product?`, 'Please confirm', {
        //         confirmButtonText: 'OK',
        //         cancelButtonText: 'Cancel',
        //         type: 'warning'
        //     })
        //     .then(() => {
        //         this
        //             .deleteProductSize(size.id)
        //             .then((size) => {
        //                 if(!size) {
        //                     throw new Error(this.$t('Product size not found'));
        //                 }

        //                 this.setProduct();

        //                 this.$emit('updated');

        //                 showNotification(
        //                     this.$notify({
        //                         type: 'success',
        //                         title: 'Size deleted:',
        //                         message: sizeName,
        //                         duration: 3000
        //                     })
        //                 );
        //             })
        //             .catch((e) => {
        //                 showNotification(
        //                     this.$notify({
        //                         type: 'error',
        //                         title: e.message,
        //                         duration: 0
        //                     })
        //                 )
        //             });
        //     })
        //     .catch(() => {
        //         // console.log("DELETE SIZE CANCELLED")
        //     });
        // },

        saveSize(size) {
            // const sizes = cloneDeep(this.sizes) || [];
            let productSizeIndex = -1;

            if(size.size) {
                // sizes.forEach((obj, index) => {
                this.product.sizes.forEach((obj, index) => {
                    if(obj.size === size.size) {
                        productSizeIndex = index;
                    }
                });

                // If this size is already in the given sizes array then replace it:
                if(productSizeIndex > -1) {
                    // sizes[productSizeIndex] = size;
                    this.product.sizes[productSizeIndex] = size;
                }
                else {
                    // sizes.push(size);
                    this.product.sizes.push(size);
                }
            }

            this.resetSizeModalData();
            // this.$emit('updated', this.product.sizes);
        }


        // saveSize(size) {
        //     let promise = null;

        //     if(size.id) {
        //         promise = this.updateProductSize(size);
        //     }
        //     else {
        //         size.product_id = this.product.id;
        //         promise = this.createProductSize(size);
        //     }

        //     promise.then((sizeJson) => {
        //         this.sizeModal.isActive = false;
        //         this.setProduct();

        //         this.$emit('updated');

        //         showNotification(
        //             this.$notify({
        //                 type: 'success',
        //                 title: 'Size updated:',
        //                 message: this.$t(sizeJson.size),
        //                 duration: 3000
        //             })
        //         )
        //     })
        //     .catch((e) => {
        //         showNotification(
        //             this.$notify({
        //                 type: 'error',
        //                 title: e.message,
        //                 duration: 0
        //             })
        //         )
        //     });
        // }
    }

    // watch: {
    //     'product' (to, from) {
    //         console.log("PRODUCT CHANGED", to)
    //     }
    // }
}
</script>


<template>
    <div v-cloak>
        <div class="tar mbm">
            <el-button type="primary" @click="openSizeEditModal()">ADD SIZE</el-button>
        </div>

        <!-- <div v-if="!sizes || !sizes.length" class="colorGrayLighter">none</div> -->
        <div v-if="!product.sizes || !product.sizes.length" class="colorGrayLighter">none</div>
        <div v-else>
            <div class="colorGrayLighter fs14 phm">{{ `${product.sizes.length} ${$tc('results', product.sizes.length)}` }}</div>
            <table class="table">
                <thead>
                    <tr>
                        <th>Size</th>
                        <th class="tar">Sort order</th>
                        <th class="tar">Is visible</th>
                        <th class="tar hide_medium_down">Cost</th>
                        <th class="tar hide_medium_down">Base price</th>
                        <th class="tar hide_medium_down">Sale price</th>
                        <th class="tar hide_medium_down">Is on sale</th>
                        <th class="tar hide_medium_down">Inventory count</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="size in product.sizes" :key="size.id">
                        <td>
                            <a @click="openSizeEditModal(size)">{{ $t(size.size) }}</a>
                        </td>
                        <td class="tar">{{ size.sort }}</td>
                        <td class="tar">
                            <i v-if="size.is_visible" class="notours icon-check-square colorGreen"></i>
                        </td>
                        <td class="tar hide_medium_down">{{ size.cost }}</td>
                        <td class="tar hide_medium_down">{{ size.base_price }}</td>
                        <td class="tar hide_medium_down">{{ size.sale_price }}</td>
                        <td class="tar hide_medium_down">
                            <i v-if="size.is_on_sale" class="notours icon-check-square colorGreen"></i>
                        </td>
                        <td class="tar hide_medium_down">{{ size.inventory_count }}</td>
                        <td class="tac">
                            <i class="notours icon-trash fs20 colorRed mlm cursorPointer" @click="deleteSize(size)"></i>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- product size edit dialog -->
        <el-dialog :title="sizeModal.sizeName ? 'EDIT: ' + $t(sizeModal.sizeName) : 'ADD SIZE'"
                   :visible.sync="sizeModal.isActive"
                   :modal-append-to-body="false">

            <form-row label="Size:">
                <el-select v-model="sizeModal.size.size" placeholder="Choose">
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
