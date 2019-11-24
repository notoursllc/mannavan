<script>
export default {
    name: 'ProductOptionValueSelect',

    props: {
        value: {
            type: Array
        },

        placeholder: {
            type: String,
            default: ''
        }
    },

    data: function() {
        return {
            optionSets: [],
            selectedOptions: []
        }
    },

    methods: {
        emitInput() {
            this.$emit('input', this.selectedOptions);
        },

        async getOptions() {
            try {
                let { data } = await this.$api.product_option_sets.list({
                    limit: 500
                });

                this.optionSets = data.map((obj) => {
                    return {
                        label: `${obj.internal_name}:`,
                        options: obj.option_values.map((item) => {
                            return {
                                value: item,
                                label: item
                            }
                        })
                    }
                });
            }
            catch(e) {
                this.$errorMessage(
                    e.message,
                    { closeOthers: true }
                )
            }
        }
    },

    created() {
        this.getOptions();
    },

    watch: {
        value: {
            handler: function(newVal) {
                if(Array.isArray(newVal)) {
                    this.selectedOptions = newVal;
                }
            },
            immediate: true
        }
    }
}
</script>


<template>
    <el-select
        v-model="selectedOptions"
        @change="emitInput"
        multiple
        filterable
        allow-create
        default-first-option
        placeholder=""
        class="widthAll">
        <el-option-group
        v-for="group in optionSets"
        :key="group.label"
        :label="group.label">
            <el-option
                v-for="item in group.options"
                :key="item.value"
                :label="item.label"
                :value="item.value">
            </el-option>
        </el-option-group>
    </el-select>
</template>
