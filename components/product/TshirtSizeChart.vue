<script>
import Vue from 'vue';
import { Dialog } from 'element-ui';
import forEach from 'lodash.foreach';
import IconEye from '@/components/icons/IconEye';
import IconSizeChartChestMeasurement from '@/components/icons/IconSizeChartChestMeasurement';
import IconSizeChartHipMeasurement from '@/components/icons/IconSizeChartHipMeasurement';
import IconSizeChartLengthMeasurement from '@/components/icons/IconSizeChartLengthMeasurement';
import IconSizeChartSleeveMeasurement from '@/components/icons/IconSizeChartSleeveMeasurement';
import globalTypes from '@/global_types.js';


let reverseMaterialTypes = {};
forEach(globalTypes.product.material_types, (val, key) => {
    reverseMaterialTypes[val] = key;
});


Vue.use(Dialog);

export default {
    props: {
        fit: {
            type: Number,
            required: true
        },
        material: {
            type: Number,
            required: false
        },
        highlight: {
            type: String,
            required: false
        }
    },

    components: {
        IconEye,
        IconSizeChartChestMeasurement,
        IconSizeChartHipMeasurement,
        IconSizeChartLengthMeasurement,
        IconSizeChartSleeveMeasurement
    },

    data: function() {
        return {
            mens: {
                MATERIAL_TYPE_TRI_BLEND: {
                    SIZE_ADULT_XS: { chest: '38-39', hip: '38-39', length: '25-26', sleeve: '7' },
                    SIZE_ADULT_S: { chest: '40-41', hip: '40-41', length: '26.5-27.5', sleeve: '7.5' },
                    SIZE_ADULT_M: { chest: '42-43', hip: '42-43', length: '27.5-28.5', sleeve: '8' },
                    SIZE_ADULT_L: { chest: '44-45', hip: '44-45', length: '28.5-29.5', sleeve: '8.5' },
                    SIZE_ADULT_XL: { chest: '46-47', hip: '46-47', length: '29.5-30.5', sleeve: '9' },
                    SIZE_ADULT_2XL: { chest: '48-49', hip: '48-49', length: '31.75-32.75', sleeve: '10.25' },
                    SIZE_ADULT_3XL: { chest: '52-53', hip: '52-53', length: '32.75-33.75', sleeve: '10.75' },
                    SIZE_ADULT_4XL: { chest: '56-57', hip: '56-57', length: '33.75-34.75', sleeve: '11.25' },
                    SIZE_ADULT_5XL: { chest: '60-61', hip: '60-61', length: '34.75-35.75', sleeve: '11.75' }
                },
                MATERIAL_TYPE_COTTON: {
                    SIZE_ADULT_XS: { chest: '37-38', hip: '37-38', length: '25-26', sleeve: '7.25' },
                    SIZE_ADULT_S: { chest: '39-40', hip: '39-40', length: '26.5-27.5', sleeve: '7.75' },
                    SIZE_ADULT_M: { chest: '41-42', hip: '41-42', length: '27.5-28.5', sleeve: '8.25' },
                    SIZE_ADULT_L: { chest: '43-44', hip: '43-44', length: '28.5-29.5', sleeve: '8.75' },
                    SIZE_ADULT_XL: { chest: '45-46', hip: '45-46', length: '29.5-30.5', sleeve: '9.25' },
                    SIZE_ADULT_2XL: { chest: '48-49.5', hip: '48-49.5', length: '32-33', sleeve: '10.25' },
                    SIZE_ADULT_3XL: { chest: '52-53.5', hip: '52-53.5', length: '33-34', sleeve: '10.75' },
                    SIZE_ADULT_4XL: { chest: '56-57.5', hip: '56-57.5', length: '34-35', sleeve: '11.25' },
                    SIZE_ADULT_5XL: { chest: '60-61.5', hip: '60-61.5', length: '35-36', sleeve: '11.75' }
                }
            },
            womens: {
                MATERIAL_TYPE_TRI_BLEND: {
                    SIZE_ADULT_XS: { chest: '33-34.5', hip: '35-36.5', length: '24-25', sleeve: '6-6.5' },
                    SIZE_ADULT_S: { chest: '35-36.5', hip: '37-38.5', length: '25-26', sleeve: '6.5-7' },
                    SIZE_ADULT_M: { chest: '37-38.5', hip: '39-40.5', length: '26-27', sleeve: '7-7.5' },
                    SIZE_ADULT_L: { chest: '39-40.5', hip: '41-42.5', length: '27-28', sleeve: '7.5-8' },
                    SIZE_ADULT_XL: { chest: '41-42.5', hip: '43-44.5', length: '28-29', sleeve: '8-8.25' },
                    SIZE_ADULT_2XL: { chest: '48-50', hip: '49-51', length: '29.5-30.5', sleeve: '8.25-8.5' },
                    SIZE_ADULT_3XL: { chest: '52-54', hip: '53-55', length: '30.5-31.5', sleeve: '8.5-9' },
                    SIZE_ADULT_4XL: { chest: '56-58', hip: '57-59', length: '31.5-32.5', sleeve: '9-9.5' },
                    SIZE_ADULT_5XL: { chest: '58-60', hip: '61-63', length: '32.5-33.5', sleeve: '9.5-10' }
                },
                MATERIAL_TYPE_COTTON: {
                    SIZE_ADULT_XS: { chest: '34-35.5', hip: '35-36.5', length: '25-26', sleeve: '6-6.5' },
                    SIZE_ADULT_S: { chest: '36-37.5', hip: '37-38.5', length: '26-27', sleeve: '6.5-7' },
                    SIZE_ADULT_M: { chest: '38-39.5', hip: '39-40.5', length: '27-28', sleeve: '7-7.5' },
                    SIZE_ADULT_L: { chest: '40-41.5', hip: '41-42.5', length: '28-29', sleeve: '7.5-8' },
                    SIZE_ADULT_XL: { chest: '42-43.5', hip: '43-44.5', length: '29-30', sleeve: '8-8.5' },
                    SIZE_ADULT_2XL: { chest: '47-49', hip: '49-51', length: '29.5-30.5', sleeve: '8-8.5' },
                    SIZE_ADULT_3XL: { chest: '51-53', hip: '53-55', length: '30.5-31.5', sleeve: '8.5-9' },
                    SIZE_ADULT_4XL: { chest: '55-57', hip: '57-59', length: '31.5-32.5', sleeve: '9-9.5' },
                    SIZE_ADULT_5XL: { chest: '59-61', hip: '61-63', length: '32.5-33.5', sleeve: '9.5-10' }
                }
            },
            headerDialog: {
                visible: false,
                type: null,
                title: null,
                description: null
            }
        }
    },

    computed: {
        tableData() {
            let materialType = reverseMaterialTypes[this.material] || 'MATERIAL_TYPE_COTTON';

            if(this.fit & globalTypes.product.fits.FIT_TYPE_GIRLS) {
                return this.womens[materialType];
            }
            else {
                return this.mens[materialType];
            }
        }
    },

    methods: {
        openHeaderDialog(type) {
            this.headerDialog.type = type;

            switch(type) {
                case 'chest':
                    this.headerDialog.title = this.$t('Chest measurement');
                    this.headerDialog.description = this.$t('chest_measurement_description');
                    break;

                case 'hip':
                    this.headerDialog.title = this.$t('Hip measurement');
                    this.headerDialog.description = this.$t('hip_measurement_description');
                    break;

                case 'length':
                    this.headerDialog.title = this.$t('Length measurement');
                    this.headerDialog.description = this.$t('length_measurement_description');
                    break;

                case 'sleeve':
                    this.headerDialog.title = this.$t('Sleeve measurement');
                    this.headerDialog.description = this.$t('sleeve_measurement_description');
                    break;
            }

            this.headerDialog.visible = true;
        }
    }
}
</script>


<template>
    <div>
        <el-dialog
            :title="headerDialog.title"
            :visible.sync="headerDialog.visible"
            width="250px"
            :lock-scroll="false">
            <div class="tac">
                <icon-size-chart-chest-measurement
                    v-show="this.headerDialog.type === 'chest'"
                    icon-name="chest-measurement"
                    width="200px" />

                <icon-size-chart-hip-measurement
                    v-show="this.headerDialog.type === 'hip'"
                    icon-name="hip-measurement"
                    width="200px" />

                <icon-size-chart-sleeve-measurement
                    v-show="this.headerDialog.type === 'sleeve'"
                    icon-name="sleeve-measurement"
                    width="200px" />

                <icon-size-chart-length-measurement
                    v-show="this.headerDialog.type === 'length'"
                    icon-name="length-measurement"
                    width="200px" />
            </div>
            <div class="mtl">{{ headerDialog.description }}</div>
        </el-dialog>

        <table class="table">
            <thead>
                <tr>
                    <th class="colorGray">{{ $t('In inches') }}</th>
                    <th class="fwb">
                        {{ $t('Chest') }}
                        <span class="header-icon" @click="openHeaderDialog('chest')">
                            <icon-eye
                                icon-name="view"
                                width="16px"
                                class-name="fillGray cursorPointer" />
                        </span>
                    </th>
                    <th class="fwb">
                        {{ $t('Hip') }}
                        <span class="header-icon" @click="openHeaderDialog('hip')">
                            <icon-eye
                                icon-name="view"
                                width="16px"
                                class-name="fillGray cursorPointer" />
                        </span>
                    </th>
                    <th class="fwb">
                        {{ $t('Length') }}
                        <span class="header-icon" @click="openHeaderDialog('length')">
                            <icon-eye
                                icon-name="view"
                                width="16px"
                                class-name="fillGray cursorPointer" />
                        </span>
                    </th>
                    <th class="fwb">
                        {{ $t('Sleeve') }}
                        <span class="header-icon" @click="openHeaderDialog('sleeve')">
                            <icon-eye
                                icon-name="view"
                                width="16px"
                                class-name="fillGray cursorPointer" />
                        </span>
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(obj, key) in tableData" :key="key" :class="{'highlight': highlight === key}">
                    <td class="fwb">{{ $t(key) }}</td>
                    <td>{{ obj.chest }}</td>
                    <td>{{ obj.hip }}</td>
                    <td>{{ obj.length }}</td>
                    <td>{{ obj.sleeve }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<style lang="scss">
    @import "~assets/css/components/_table.scss";
    @import "~assets/css/components/_variables.scss";

    .header-icon {
        display: inline;
        margin: 0;
        padding-left: 3px;
    }

    @media #{$small-and-down} {
        .header-icon {
            display: block;
            margin: 2px 0 0 0;
            padding: 0;
        }
    }
</style>
