<script>
    import Vue from 'vue'
    import { Select, Option, Input } from 'element-ui'
    import states from '@/utils/countryStates.js'

    Vue.use(Select);
    Vue.use(Option);
    Vue.use(Input);

    export default{
        props: {
            value: {
                type: String,
                default: ''
            },

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
            }
        },

        computed: {
            stateOptions: function() {
                return (this.country && states.hasOwnProperty(this.country)) ? states[this.country] : null;
            }
        },

        data() {
            return {
                selectedState: null
            }
        },

        created() {
            this.selectedState = this.initValue;
        },

        methods: {
            emitChange(val) {
                this.$emit('input', val)
            }
        },

        watch: {
            'value' (to, from) {
                this.selectedState = to;
            },

            /**
             * Clear the previously selected state when the country changes
             */
            'country' (to, from) {
                this.selectedState = null;
                this.emitChange(null);
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
            v-model="selectedState"
            @change="emitChange"
            :disabled="disabled"></el-input>
</template>
