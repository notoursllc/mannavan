<script>
import states from '@/utils/countryStates.js'

export default{
    props: {
        value: {
            type: String
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
            this.selectedState = val;
            this.$emit('input', val)
        }
    },

    created: function() {
        this.$watch(
            'value',
            function(newVal, oldVal) {
                this.selectedState = newVal;
            },
            { immediate: true }
        )

        this.$watch(
            'country',
            function(newVal, oldVal) {
                this.selectedState = null;
                this.emitChange(null);
            }
        )
    }
}
</script>


<template>
    <div class="inlineBlock widthAll">
        <el-select
            v-if="stateOptions"
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
    </div>
</template>
