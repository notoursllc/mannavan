<script>
import forEach from 'lodash.foreach'

export default {
    props: {
        value: {},

        placeholder: {
            type: String,
            default: ''
        },

        options: {
            type: Array,
            required: true
        }
    },

    data: function() {
        return {
            selectedVal: []
        }
    },

    methods: {
        selectValueChanged(valueArray) {
            let total = 0;

            if(!Array.isArray(valueArray)) {
                valueArray = [valueArray];
            }

            let val = valueArray.forEach(function(val) {
                total += val;
            })

            this.$emit('input', total)
        },

        setSelectedValue() {
            let values = [];

            this.options.forEach((obj) => {
                if(obj.value & this.value) {
                    values.push(obj.value);
                }
            });

            this.selectedVal = values;
        }
    },

    watch: {
        value: {
            handler(newVal) {
                this.setSelectedValue();
            },
            immediate: true,
        },

        options: {
            handler(newVal) {
                this.setSelectedValue();
            },
            immediate: true,
        }
    }
}
</script>

<template>
    <el-select
        v-model="selectedVal"
        multiple
        :placeholder="placeholder"
        :clearable="true"
        @change="selectValueChanged"
        @clear="() => { selectedVal = null }">
        <el-option
            v-for="obj in options"
            :key="obj.value"
            :label="obj.label"
            :value="obj.value"
            :disabled="obj.disabled" />
    </el-select>
</template>
