<script>
    import Vue from 'vue'
    import { Select } from 'element-ui'
    import states from '@/utils/countryStates.js'

    Vue.use(Select)

    export default{
        props: {
            placeholder: {
                type: String,
                default: ''
            },

            country: {
                type: String
            },

            disabled: {
                type: Boolean,
                default: false,
            },

            // this allows using the `value` prop for a different purpose
            initValue: {
                type: String
            }
        },

        created() {
            this.selectedState = this.initValue;
        },

        methods: {
            emitChange(val) {
                this.$emit('change', val)
            },

            emitVisibleChange(val) {
               this.$emit('visible-change', val)
            }
        },

        computed: {
            optionValueAttr: function() {
                return (this.valueType && this.countries[0].hasOwnProperty(this.valueType) ? this.valueType : 'alpha2');
            },

            stateOptions: function() {
                return (this.country && states.hasOwnProperty(this.country)) ? states[this.country] : null;
            }
        },

        watch: {
            'initValue' (to, from) {
                this.selectedState = to;
            },

            /**
             * Clear the previously selected state when the country changes
             */
            'country' (to, from) {
                this.selectedState = null;
                this.emitChange(null);
            }
        },

        data() {
            return {
                selectedState: null
            }
        }
    }
</script>


<template>
    <el-select v-if="stateOptions"
               filterable
               v-model="selectedState"
               :placeholder="placeholder"
               :no-match-text="$t('No matching values')"
               @change="emitChange"
               @visible-change="emitVisibleChange"
               :disabled="disabled"
               class="widthAll">
        <el-option
                v-for="(label, abbr) in stateOptions"
                :key="abbr"
                :label="$t(label)"
                :value="abbr">
        </el-option>
    </el-select>

    <el-input v-else
            v-model.trim="selectedState"
            @change="emitChange"
            :disabled="disabled"></el-input>
</template>
