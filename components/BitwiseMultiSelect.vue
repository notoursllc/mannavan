<script>
export default {
    props: {
        value: {
            type: Object,
            default: () => {
                return {};
            }
        },

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
        };
    },

    watch: {
        value: {
            handler(newVal) {
                this.setSelectedValue();
            },
            immediate: true
        },

        options: {
            handler(newVal) {
                this.setSelectedValue();
            },
            immediate: true
        }
    },

    methods: {
        selectValueChanged(valueArray) {
            let total = 0;

            if(!Array.isArray(valueArray)) {
                valueArray = [valueArray];
            }

            valueArray.forEach((val) => {
                total += val;
            });

            this.$emit('input', total);
        },

        setSelectedValue() {
            if(!this.multiple) {
                this.selectedVal = this.value;
                return;
            }

            const values = [];

            this.options.forEach((obj) => {
                if(obj.value & this.value) {
                    values.push(obj.value);
                }
            });

            this.selectedVal = values;
        }
    }
};
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
