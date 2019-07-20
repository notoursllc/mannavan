<script>
import FormRow from '@/components/FormRow'
import IconPencil from '@/components/icons/IconPencil'
import IconTrash from '@/components/icons/IconTrash'
import IconCheckSquare from '@/components/icons/IconCheckSquare'
import product_mixin from '@/mixins/product_mixin'


let currentNotification = null;

const sizeModalFormDefaults = {
    is_visible: true
};


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
            this.sizeModal.size = sizeModalFormDefaults;
        },


        openSizeUpsertModal(size) {
            this.setSizeOptions(this.product.sizes);
            this.sizeModal.size = size || sizeModalFormDefaults;
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

                <el-table-column type="expand">
                    <template slot-scope="scope">
                        <pre style="overflow-x:scroll">{{ scope.row | formatJson }}</pre>
                    </template>
                </el-table-column>

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
                    label="Price"
                    align="right">
                    <template slot-scope="scope">
                        <div :class="{'colorGrayLighter strikethrough': scope.row.is_on_sale}">{{ scope.row.base_price }}</div>
                        <div v-if="scope.row.is_on_sale">{{ scope.row.sale_price }}</div>
                    </template>
                </el-table-column>

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

                <!-- weight -->
                <el-table-column
                    prop="weight_oz"
                    label="Weight (oz)"
                    align="right">
                    <template slot-scope="scope">
                        <div v-if="scope.row.weight_oz > 0">{{ scope.row.weight_oz }}</div>
                    </template>
                </el-table-column>

                <!-- inventory count -->
                <el-table-column
                    prop="inventory_count"
                    label="Inventory"
                    align="right">
                </el-table-column>
            </el-table>
        </div>

        <!-- product size edit dialog -->
        <el-dialog :title="sizeModal.size.size ? 'EDIT: ' + $t(sizeModal.size.size) : 'ADD SIZE'"
                   :visible.sync="sizeModal.isActive"
                   :modal-append-to-body="false">

            <form-row>
                <template slot="label">Size:</template>
                <template slot="value">
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
                </template>
            </form-row>

            <form-row>
                <template slot="label">Is visible:</template>
                <template slot="value">
                    <el-checkbox v-model="sizeModal.size.is_visible" />
                </template>
            </form-row>

            <form-row>
                <template slot="label">Cost:</template>
                <template slot="value">
                    <el-input-number
                        v-model="sizeModal.size.cost"
                        controls-position="right"
                        :step=".01" />
                </template>
            </form-row>

            <form-row>
                <template slot="label">Base price:</template>
                <template slot="value">
                    <el-input-number
                        v-model="sizeModal.size.base_price"
                        controls-position="right"
                        :step=".01" />
                </template>
            </form-row>

            <form-row>
                <template slot="label">Sale price:</template>
                <template slot="value">
                    <el-input-number
                        v-model="sizeModal.size.sale_price"
                        controls-position="right"
                        :step=".01" />
                </template>
            </form-row>

            <form-row>
                <template slot="label">Is on sale:</template>
                <template slot="value">
                    <el-checkbox v-model="sizeModal.size.is_on_sale" />
                </template>
            </form-row>

            <form-row>
                <template slot="label">Inventory count:</template>
                <template slot="value">
                    <el-input-number
                        v-model="sizeModal.size.inventory_count"
                        controls-position="right"
                        :step="1" />
                </template>
            </form-row>

            <form-row>
                <template slot="label">Weight (oz):</template>
                <template slot="value">
                    <el-input-number
                        v-model="sizeModal.size.weight_oz"
                        controls-position="right"
                        :step=".1" />
                </template>
            </form-row>

            <form-row>
                <template slot="value">
                    <div class="ptl">
                        <el-button
                            type="primary"
                            class="mrm"
                            @click="saveSize(sizeModal.size)">SAVE</el-button>

                        <el-button @click="resetSizeModalData()">CANCEL</el-button>
                    </div>
                </template>
            </form-row>
        </el-dialog>
    </div>
</template>
