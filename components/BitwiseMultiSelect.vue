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
            type: Object,
            required: true
        }
    },

    data: function() {
        return {
            selectedVal: []
        }
    },


    methods: {
        selectValueChanged: function(valueArray) {
            let total = 0;

            if(!Array.isArray(valueArray)) {
                valueArray = [valueArray];
            }

            let val = valueArray.forEach(function(val) {
                total += val;
            })

            this.$emit('input', total)
        }
    },

    created: function() {
        let unwatch = this.$watch('options', function(newVal, oldVal) {
            let values = [];

            forEach(this.options, (val, key) => {
                if(val & this.value) {
                    values.push(val);
                }
            })

            this.selectedVal = values;
            // unwatch();
        })
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
            v-for="(val, key) in options"
            :key="val"
            :label="key"
            :value="val">
        </el-option>
    </el-select>
</template>
