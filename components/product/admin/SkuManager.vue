<script>
import isObject from 'lodash.isobject';
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
        TextCard: () => import('@/components/TextCard'),
        CountrySelect: () => import('@/components/CountrySelect'),
        ImageManager: () => import('@/components/product/admin/ImageManager'),
    },

    mixins: [
        storage_mixin
    ],

    data: function() {
        return {
            skus: [],
            skuDialog: {
                show: false,
                sku: {
                    attributes: []
                }
            },
            imageManagerValue: [],
            imageManagerMaxImages: process.env.IMAGE_MANAGER_MAX_IMAGES || 8,
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
        showSkuDialog(index) {
            let sku = this.product.skus[index];

            this.skuDialog.sku = sku;

            if(!this.skuDialog.sku.hasOwnProperty('imagesTmp')) {
                this.skuDialog.sku.imagesTmp = [];
            }

            this.skuDialog.title = sku.attributes.map(obj => obj.value).join(' / ');
            this.skuDialog.show = true;

            console.log("showSkuDialog SKU", this.skuDialog.sku)
        },

        onClickDone() {
            this.skuDialog.show = false;
            console.log("DONE", this.product)
        },

        async upsertImages() {
            if(Array.isArray(this.imageManagerValue)) {
                const result = this.storagemix_uploadImages(this.imageManagerValue);

                // 'result' only contains the new images that were added (not the pre-existing ones)
                // so if there are pre-existing images, we just concat the new ones to the list
                // otherwise we set the images data to the imageUploadResult

                if(Array.isArray(this.skuDialog.sku.images)) {
                    this.skuDialog.sku.images = this.skuDialog.sku.images.concat(result)
                }
                else {
                    this.skuDialog.sku.images = result;
                }
            }
        },

        async saveSku() {
            // Delete the unused images
            try {
                await this.storagemix_deleteProductImages(this.imageManagerValue, this.skuDialog.sku.images);
            }
            catch(err) {
                console.error(err);
                this.$bugsnag.notify(err);
            }

            try {
                await this.upsertImages();
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
            this.skuDialog.show = true;
        },
    }
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
                        <el-button @click="showSkuDialog(scope.$index)">{{ $t('more') }}</el-button>

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


            <!-- Images -->
            <text-card>
                <div slot="header">
                    {{ $t('Images') }}
                    <span class="fs11 plm">{{ $t('You can add up to num images', {number: imageManagerMaxImages}) }}</span>
                </div>
                <image-manager
                    v-model="skuDialog.sku.imagesTmp"
                    :max-num-images="parseInt(imageManagerMaxImages, 10)" />
                <!-- <image-manager
                    v-model="imageManagerValue"
                    :max-num-images="parseInt(imageManagerMaxImages, 10)" /> -->
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
