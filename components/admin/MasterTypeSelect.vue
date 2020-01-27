<script>
export default {
    name: 'MasterTypeSelect',

    props: {
        object: {
            type: String,
            required: true
        },

        value: {
            type: Number
        },

        multiple: {
            type: Boolean,
            default: true
        }
    },

    components: {
        BitwiseMultiSelect: () => import('@/components/BitwiseMultiSelect')
    },

    data: function() {
        return {
            selectedVal: null,
            selectOptions: []
        }
    },

    methods: {
        emitChange(val) {
            // when the select clear button is clicked then the val changes to "0",
            // but we want null instead:
            if(!val) {
                this.$emit('input', null)
            }
            else {
                this.$emit('input', val)
            }
        },

        async createOptions() {
            let opts = [];
            let types = await this.$api.masterTypes.list(this.object);

            types.forEach((obj) => {
                opts.push(
                    {
                        label: obj.name,
                        value: obj.value,
                        disabled: !obj.published
                    }
                )
            });

            this.selectOptions = opts
        }
    },

    created() {
        this.createOptions();
    },

    watch: {
        value: {
            handler(newVal) {
                this.selectedVal = newVal;
            },
            immediate: true,
        }
    }
}
</script>


<template>
    <bitwise-multi-select
        v-model="selectedVal"
        :options="selectOptions"
        :multiple="multiple"
        @input="emitChange" />
</template>
