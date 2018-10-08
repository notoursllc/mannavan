<script>
import Vue from 'vue';
import { Dialog } from 'element-ui';
import IconEye from '@/components/icons/IconEye';
import IconSizeChartChestMeasurement from '@/components/icons/IconSizeChartChestMeasurement';
import IconSizeChartHipMeasurement from '@/components/icons/IconSizeChartHipMeasurement';
import IconSizeChartLengthMeasurement from '@/components/icons/IconSizeChartLengthMeasurement';
import IconSizeChartSleeveMeasurement from '@/components/icons/IconSizeChartSleeveMeasurement';

Vue.use(Dialog);

export default {
    props: {
        type: {
            type: String,
            required: true
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
            mens: [
                { size: this.$t('SIZE_ADULT_XS'), chest: '38-39', hip: '38-39', length: '25-26', sleeve: '7' },
                { size: this.$t('SIZE_ADULT_S'), chest: '40-41', hip: '40-41', length: '26.5-27.5', sleeve: '7.5' },
                { size: this.$t('SIZE_ADULT_M'), chest: '42-43', hip: '42-43', length: '27.5-28.5', sleeve: '8' },
                { size: this.$t('SIZE_ADULT_L'), chest: '44-45', hip: '44-45', length: '28.5-29.5', sleeve: '8.5' },
                { size: this.$t('SIZE_ADULT_XL'), chest: '46-47', hip: '46-47', length: '29.5-30.5', sleeve: '9' },
                { size: this.$t('SIZE_ADULT_2XL'), chest: '48-49', hip: '48-49', length: '31.75-32.75', sleeve: '10.25' },
                { size: this.$t('SIZE_ADULT_3XL'), chest: '52-53', hip: '52-53', length: '32.75-33.75', sleeve: '10.75' },
                { size: this.$t('SIZE_ADULT_4XL'), chest: '56-57', hip: '56-57', length: '33.75-34.75', sleeve: '11.25' },
                { size: this.$t('SIZE_ADULT_5XL'), chest: '60-61', hip: '60-61', length: '34.75-35.75', sleeve: '11.75' }
            ],
            headerDialog: {
                visible: false,
                type: null,
                title: null,
                description: null
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
                        <span @click="openHeaderDialog('chest')">
                            <icon-eye
                                icon-name="view"
                                width="16px"
                                class-name="fillGray cursorPointer" />
                        </span>
                    </th>
                    <th class="fwb">
                        {{ $t('Hip') }}
                        <span @click="openHeaderDialog('hip')">
                            <icon-eye
                                icon-name="view"
                                width="16px"
                                class-name="fillGray cursorPointer" />
                        </span>
                    </th>
                    <th class="fwb">
                        {{ $t('Length') }}
                        <span @click="openHeaderDialog('length')">
                            <icon-eye
                                icon-name="view"
                                width="16px"
                                class-name="fillGray cursorPointer" />
                        </span>
                    </th>
                    <th class="fwb">
                        {{ $t('Sleeve') }}
                        <span @click="openHeaderDialog('sleeve')">
                            <icon-eye
                                icon-name="view"
                                width="16px"
                                class-name="fillGray cursorPointer" />
                        </span>
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(obj, index) in mens" :key="index">
                    <td class="fwb">{{ obj.size }}</td>
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
</style>
