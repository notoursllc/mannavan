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
        },

        multiple: {
            type: Boolean,
            default: true
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
            if(!this.multiple) {
                this.selectedVal = this.value;
                return;
            }

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
                console.log("OPTIONS", newVal)
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
        :multiple="multiple"
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
