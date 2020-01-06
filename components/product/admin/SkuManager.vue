<script>
import isObject from 'lodash.isobject';
import cloneDeep from 'lodash.clonedeep';
import storage_mixin from '@/mixins/storage_mixin';

export default {
    name: 'SkuManager',

    props: {
        product: {
            type: Object
        },

        detailsView: {
            type: Boolean,
            default: false
        }
    },

    components: {
        InputMoney: () => import('@/components/admin/InputMoney'),
        AppDialog: () => import('@/components/AppDialog'),
        SkuUpsertForm: () => import('@/components/product/admin/SkuUpsertForm'),
    },

    mixins: [
        storage_mixin
    ],

    data: function() {
        return {
            skuDialog: {
                show: false,
                action: 'append', // add / append
                sku: {
                    attributes: []
                }
            }
        }
    },

    computed: {
        tableColumnLabels() {
            if(this.product && Array.isArray(this.product.attributes)) {
                return this.product.attributes.map(obj => obj.label);
            }
            return [];
        },

        showAddVariantButton() {
            return isObject(this.product) && this.product.id;
        }
    },

    methods: {
        onClickMoreSkuInfo(index) {
            let sku = this.product.skus[index];

            this.skuDialog.sku = sku;
            this.skuDialog.title = sku.attributes.map(obj => obj.value).join(' / ');
            this.skuDialog.action = 'append';
            this.skuDialog.show = true;
        },

        onClickAddVariant() {
            let sku = {
                attributes: [],
                product_id: this.product.id
            };

            this.tableColumnLabels.forEach((label, index) => {
                sku.attributes[index] = { value: '' }
            });

            // https://vuejs.org/v2/guide/reactivity.html#Change-Detection-Caveats
            this.skuDialog.sku = Object.assign({}, sku);
            this.skuDialog.title = this.$t('Add variant');
            this.skuDialog.action = 'add';
            this.skuDialog.show = true;
        },

        onSkuUpsertDone() {
            if(this.skuDialog.action === 'add') {
                this.product.skus.push(
                    cloneDeep(this.skuDialog.sku)
                );
            }

            this.resetSkuDialog();
            console.log("DONE", this.product)
        },

        resetSkuDialog() {
            this.skuDialog.sku = {
                attributes: []
            };
            this.skuDialog.title = null;
            this.skuDialog.action = 'append';
            this.skuDialog.show = false;
        },

        async deleteSku(id) {
            //TODO
        }
    },

    // watch: {
    //     product: {
    //         handler(newVal) {
    //             // adding the 'tmp' property to the product
    //             if(isObject(newVal)) {
    //                 if(!newVal.hasOwnProperty('tmp')) {
    //                     // https://vuejs.org/v2/guide/reactivity.html
    //                     this.$set(newVal, 'tmp', {
    //                         deletedSkus: []
    //                     });
    //                 }
    //             }
    //         },
    //         immediate: true
    //     }
    // }
}
</script>


<template>
    <div style="overflow-x: scroll">
        <div class="tar" v-if="showAddVariantButton">
            <el-button
                @click="onClickAddVariant"
                size="mini">{{ $t('Add variant')}}</el-button>
        </div>

        <el-table
            :data="product.skus"
            class="widthAll">

            <template v-for="(label, index) in tableColumnLabels">
                <el-table-column
                    :label="label"
                    :key="index"
                    width="110px">
                    <template slot-scope="scope" v-if="scope.row.attributes[index]">
                        <span v-if="detailsView" class="variant-label">
                            {{ scope.row.attributes[index].value }}
                        </span>
                        <template v-else>
                            <el-input
                                v-model="scope.row.attributes[index].value" />
                        </template>
                    </template>
                </el-table-column>
            </template>

            <!-- Price -->
            <el-table-column
                :label="$t('Price')"
                width="150px">
                <template slot-scope="scope">
                    <input-money
                        v-model="scope.row.base_price" />
                </template>
            </el-table-column>

            <!-- Qty -->
            <el-table-column
                :label="$t('Quantity')"
                width="125px">
                <template slot-scope="scope">
                    <el-input-number
                        v-model="scope.row.inventory_count"
                        :min="1"
                        :step="1"
                        controls-position="right"
                        step-strictly
                        class="input-number" />
                </template>
            </el-table-column>

            <!-- SKU -->
            <el-table-column
                :label="$t('SKU')"
                width="150px">
                <template slot-scope="scope">
                    <el-input v-model="scope.row.sku" />
                </template>
            </el-table-column>

            <el-table-column>
                <template slot-scope="scope">
                    <el-button-group>
                        <el-button @click="onClickMoreSkuInfo(scope.$index)">{{ $t('more') }}</el-button>

                        <el-popconfirm
                            v-if="!detailsView"
                            :title="$t('Delete this option?')"
                            :confirmButtonText="$t('OK')"
                            :cancelButtonText="$t('cancel')"
                            @onConfirm="deleteSku(scope.row.id)">
                            <el-button slot="reference" icon="el-icon-delete"></el-button>
                        </el-popconfirm>
                    </el-button-group>
                </template>
            </el-table-column>
        </el-table>

        <app-dialog
            :title="skuDialog.title"
            :visible.sync="skuDialog.show">
            <sku-upsert-form
                :sku="skuDialog.sku"
                :product-attributes="product.attributes"
                @done="onSkuUpsertDone" />
        </app-dialog>
    </div>
</template>


<style lang="scss">
@import "~assets/css/components/_formRow.scss";

.el-popconfirm__action {
    margin-top: 10px;
}

.input-number {
    width: 105px;
}

.variant-label {
    word-wrap: break-word;
    word-break: break-word;
    overflow-wrap: break-word;
}
</style>
