<script>
import cloneDeep from 'lodash.clonedeep';
import isObject from 'lodash.isobject';
import storage_mixin from '@/mixins/storage_mixin'; // TODO: not needed?

export default {
    name: 'SkuUpsertForm',

    props: {
        sku: {
            type: Object
        },

        productAttributes: {
            type: Array
        }
    },

    components: {
        InputMoney: () => import('@/components/admin/InputMoney'),
        TextCard: () => import('@/components/TextCard'),
        CountrySelect: () => import('@/components/CountrySelect'),
        ImageManager: () => import('@/components/product/admin/ImageManager'),
    },

    mixins: [
        storage_mixin
    ],

    data: function() {
        return {
            imageManagerMaxImages: process.env.IMAGE_MANAGER_MAX_IMAGES || 8,
            loadingImages: false,
        }
    },

    computed: {
        tableColumnLabels() {
            if(Array.isArray(this.productAttributes)) {
                return this.productAttributes.map(obj => obj.label);
            }
            return [];
        }
    },

    methods: {
        onClickDone() {
            this.$emit('done')
        },

        async onDeleteSkuImage(id) {
            try {
                this.loadingImages = true;
                await this.$api.products.deleteSkuImage(id);
                this.$successMessage(this.$t('Image deleted successfully'));
            }
            catch(e) {
                this.$errorMessage(
                    e.message,
                    { closeOthers: true }
                )
            }

            this.loadingImages = false;
        },
    },

    watch: {
        sku: {
            handler(newVal) {
                if(isObject(newVal)) {
                    if(!Array.isArray(newVal.images)) {
                        newVal.images = [];
                    }
                }
            },
            immediate: true
        }
    }
}
</script>


<template>
    <div>
        <!-- options -->
        <text-card>
            <div slot="header">{{ $t('Attributes') }}</div>

            <div class="inputGroupContainer">
                <div v-for="(label, index) in tableColumnLabels"
                    :key="index"
                    class="inputGroup mrl mbm" >
                    <label>{{ label }}</label>
                    <div v-if="sku.attributes[index]">
                        <span
                            v-if="sku.id"
                            class="fwb">{{ sku.attributes[index].value }}</span>

                        <el-input
                            v-else
                            v-model="sku.attributes[index].value" />
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
                        v-model="sku.base_price" />
                </div>

                <!-- compare at price -->
                <div class="inputGroup mrl mbm" >
                    <label>{{ $t('Compare at price') }}</label>
                    <input-money
                        v-model="sku.compare_at_price" />
                </div>

                <!-- cost pre item -->
                <div class="inputGroup mrl mbm" >
                    <label>{{ $t('Cost per item') }}</label>
                    <input-money
                        v-model="sku.cost_price" />
                </div>
            </div>

            <!-- Charge tax on this product -->
            <div class="mtm" >
                <el-checkbox
                    v-model="sku.is_taxable" >{{ $t('Charge tax on this product') }}</el-checkbox>
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
                        v-model="sku.inventory_count"
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
                        v-model="sku.sku" />
                </div>

                <!-- barcode -->
                <div class="inputGroup mrl mbm" >
                    <label>{{ $t('Barcode (ISBN, UPC, GTIN, etc.)') }}</label>
                    <el-input
                        v-model="sku.barcode" />
                </div>
            </div>

            <!-- track quantity -->
            <div class="mtm" >
                <el-checkbox
                    v-model="sku.track_quantity" >{{ $t('Track quantity') }}</el-checkbox>
            </div>

            <!-- Continue selling when out of stock -->
            <div class="mtm" >
                <el-checkbox
                    v-model="sku.visible_if_out_of_stock" >{{ $t('Continue selling when out of stock') }}</el-checkbox>
            </div>
        </text-card>


        <!-- Images -->
        <text-card>
            <div slot="header">
                {{ $t('Images') }}
                <span class="fs11 plm">{{ $t('You can add up to num images', {number: imageManagerMaxImages}) }}</span>
            </div>
            <image-manager
                v-loading="loadingImages"
                v-model="sku.images"
                @delete="onDeleteSkuImage"
                :max-num-images="parseInt(imageManagerMaxImages, 10)" />
        </text-card>


        <!-- shipping -->
        <text-card>
            <div slot="header">{{ $t('Shipping') }}</div>

            <div class="inputGroupContainer">
                <!-- weight -->
                <div class="inputGroup mrl mbm" >
                    <label>{{ $t('Weight (oz)') }}</label>
                    <el-input-number
                        v-model="sku.weight_oz"
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
                        v-model="sku.customs_country_of_origin" />
                    <div class="colorGrayLighter">{{ $t('customs_country_of_origin_desc')}}</div>
                </div>

                <!-- hs code -->
                <div class="inputGroup mrl mbm" >
                    <label>{{ $t('HS (Harmonized System) code') }}</label>
                    <el-input
                        v-model="sku.customs_harmonized_system_code" />
                    <div class="colorGrayLighter">{{ $t('customs_hs_code_desc')}}</div>
                </div>
            </div>
        </text-card>


        <div class="mtl tac">
            <el-button
                type="primary"
                @click="onClickDone">{{ $t('Done') }}</el-button>

            <!-- <el-button
                v-if="!sku.id"
                type="primary"
                @click="onClickDone">{{ $t('Done') }}</el-button>

            <el-button
                v-else
                type="primary"
                @click="saveSku">{{ $t('Save') }}</el-button> -->
        </div>
    </div>
</template>


<style lang="scss">
@import "~assets/css/components/_formRow.scss";

.input-number {
    width: 105px;
}
</style>
