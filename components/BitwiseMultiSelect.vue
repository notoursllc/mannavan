<script>
import Vue from 'vue'
import { Select } from 'element-ui'
import forEach from 'lodash.foreach'

Vue.use(Select);

export default {
    props: {
        placeholder: {
            type: String,
            default: ''
        },

        options: {
            type: Object,
            required: true
        },

        init: {
            type: Number
        }
    },

    data: function() {
        return {
            selectedVal: null
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

            this.$emit('changed', total)
        }
    },

    created: function() {
        let unwatch = this.$watch('init', function(newVal, oldVal) {
            let values = [];

            forEach(this.options, function(val, key) {
                if(val & newVal) {
                    values.push(val);
                }
            })

            this.selectedVal = values;
            unwatch();
        })
    }
}
</script>

<template>
    <el-select
        v-model="selectedVal"
        multiple
        :placeholder="placeholder"
        @change="selectValueChanged">
        <el-option
            v-for="(val, key) in options"
            :key="val"
            :label="key"
            :value="val">
        </el-option>
    </el-select>
</template>

<style lang="scss">

</style>
