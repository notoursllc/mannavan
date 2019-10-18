<script>
import material_type_mixin from '@/mixins/material_type_mixin';

export default {
    props: {
        value: {
            type: Number
        }
    },

    components: {
        BitwiseMultiSelect: () => import('@/components/BitwiseMultiSelect')
    },

    mixins: [
        material_type_mixin
    ],

    data: function() {
        return {
            selectedVal: null,
            selectOptions: []
        }
    },

    methods: {
        emitChange(val) {
            this.$emit('input', val)
        },

        async createOptions() {
            let opts = [];
            let types = await this.matmix_list();

            types.forEach((obj) => {
                opts.push(
                    {
                        label: this.$t(obj.name),
                        value: obj.value,
                        disabled: !obj.is_available
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
        @input="emitChange" />
</template>
