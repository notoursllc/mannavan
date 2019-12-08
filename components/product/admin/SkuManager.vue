<script>
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
        TextCard: () => import('@/components/TextCard'),
        CountrySelect: () => import('@/components/CountrySelect'),
    },

    data: function() {
        return {
            skus: [],
            skuDialog: {
                show: false,
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
        }
    },

    methods: {
        showSkuDialog(index) {
            let sku = this.product.skus[index];

            this.skuDialog.sku = sku;
            this.skuDialog.title = sku.attributes.map(obj => obj.value).join(' / ');
            this.skuDialog.show = true;
        },

        onClickDone() {
            this.skuDialog.show = false;
        },

        async saveSku() {
            try {
                await this.$api.skus.upsert(this.skuDialog.sku);
                this.$successMessage(this.$t('Option saved successfully'));
                this.skuDialog.show = false;
                this.$emit('optionUpdated');
            }
            catch(err) {
                this.$errorMessage(this.$t('An error occurred'));
                console.error(err)
            }

        },

        async deleteSku(id) {
            try {
                await this.$api.skus.delete(id);
                this.$successMessage(this.$t('Option deleted successfully'));
                this.$emit('optionDeleted');
            }
            catch(err) {
                this.$errorMessage(this.$t('An error occurred'));
                console.error(err)
            }
        }
    }
}
</script>


<template>
    <div style="overflow-x: scroll">
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
                        <el-button icon="el-icon-edit" @click="showSkuDialog(scope.$index)"></el-button>

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
            {{ skuDialog.sku }}

            <!-- options -->
            <text-card>
                <div slot="header">{{ $t('Options') }}</div>

                <div class="inputGroupContainer">
                    <div v-for="(label, index) in tableColumnLabels"
                        :key="index"
                        class="inputGroup mrl mbm" >
                        <label>{{ label }}</label>
                        <div v-if="skuDialog.sku.attributes[index]">
                            <template v-if="detailsView">
                                {{ skuDialog.sku.attributes[index].value }}
                            </template>
                            <template v-else>
                                <el-input
                                    v-model="skuDialog.sku.attributes[index].value" />
                            </template>
                        </div>
                    </div>
                </div>
            </text-card>

            <!-- pricing -->
            <text-card>
                <div slot="header">{{ $t('Pricing') }}</div>

                <div class="inputGroupContainer">
                    <!-- price -->
                    <div class="inputGroup mrl mbm" >
                        <label>{{ $t('Price') }}</label>
                        <input-money
                            v-model="skuDialog.sku.base_price" />
                    </div>

                    <!-- compare at price -->
                    <div class="inputGroup mrl mbm" >
                        <label>{{ $t('Compare at price') }}</label>
                        <input-money
                            v-model="skuDialog.sku.compare_at_price" />
                    </div>

                    <!-- cost pre item -->
                    <div class="inputGroup mrl mbm" >
                        <label>{{ $t('Cost per item') }}</label>
                        <input-money
                            v-model="skuDialog.sku.cost_price" />
                    </div>
                </div>

                <!-- Charge tax on this product -->
                <div class="mtm" >
                    <el-checkbox
                        v-model="skuDialog.sku.is_taxable" >{{ $t('Charge tax on this product') }}</el-checkbox>
                </div>
            </text-card>

            <!-- inventory -->
            <text-card>
                <div slot="header">{{ $t('Inventory') }}</div>

                <div class="inputGroupContainer">
                    <!-- qty -->
                    <div class="inputGroup mrl mbm" >
                        <label>{{ $t('Quantity') }}</label>
                        <el-input-number
                            v-model="skuDialog.sku.inventory_count"
                            :min="1"
                            :step="1"
                            controls-position="right"
                            step-strictly
                            class="input-number" />
                    </div>

                    <!-- sku -->
                    <div class="inputGroup mrl mbm" >
                        <label>{{ $t('SKU (Stock Keeping Unit)') }}</label>
                        <el-input
                            v-model="skuDialog.sku.sku" />
                    </div>

                    <!-- barcode -->
                    <div class="inputGroup mrl mbm" >
                        <label>{{ $t('Barcode (ISBN, UPC, GTIN, etc.)') }}</label>
                        <el-input
                            v-model="skuDialog.sku.barcode" />
                    </div>
                </div>

                <!-- track quantity -->
                <div class="mtm" >
                    <el-checkbox
                        v-model="skuDialog.sku.track_quantity" >{{ $t('Track quantity') }}</el-checkbox>
                </div>

                <!-- Continue selling when out of stock -->
                <div class="mtm" >
                    <el-checkbox
                        v-model="skuDialog.sku.visible_if_out_of_stock" >{{ $t('Continue selling when out of stock') }}</el-checkbox>
                </div>
            </text-card>

            <!-- shipping -->
            <text-card>
                <div slot="header">{{ $t('Shipping') }}</div>

                <div class="inputGroupContainer">
                    <!-- weight -->
                    <div class="inputGroup mrl mbm" >
                        <label>{{ $t('Weight (oz)') }}</label>
                        <el-input-number
                            v-model="skuDialog.sku.weight_oz"
                            :min="0"
                            :step=".01"
                            controls-position="right"
                            step-strictly
                            class="input-number" />
                    </div>
                </div>

                <hr/>

                <h4>{{ $t('CUSTOMS INFORMATION')}}</h4>

                <div class="inputGroupContainer">
                    <!-- country of origin -->
                    <div class="inputGroup mrl mbm" >
                        <label>{{ $t('Country of origin') }}</label>
                        <country-select
                            v-model="skuDialog.sku.customs_country_of_origin" />
                        <div class="colorGrayLighter">{{ $t('customs_country_of_origin_desc')}}</div>
                    </div>

                    <!-- hs code -->
                    <div class="inputGroup mrl mbm" >
                        <label>{{ $t('HS (Harmonized System) code') }}</label>
                        <el-input
                            v-model="skuDialog.sku.customs_harmonized_system_code" />
                        <div class="colorGrayLighter">{{ $t('customs_hs_code_desc')}}</div>
                    </div>
                </div>
            </text-card>

            <div class="mtl tac">
                <el-button
                    v-if="detailsView"
                    type="primary"
                    @click="onClickDone">{{ $t('Done') }}</el-button>

                <el-button
                    v-else
                    type="primary"
                    @click="saveSku">{{ $t('Save') }}</el-button>
            </div>
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
