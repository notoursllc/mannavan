<script>
export default{
    name: 'ProductSubtypeSelect',

    props: {
        value: {
            type: Number
        }
    },

    components: {
        BitwiseMultiSelect: () => import('@/components/BitwiseMultiSelect')
    },

    computed: {
        selectOptions() {
            let opts = {};
            let self = this;

            const subTypes = Object.assign({}, this.$store.state.product.subTypes);

            Object.keys(subTypes).forEach((key) => {
                opts[this.$tc(key, 2)] = subTypes[key].value;
            });

            return opts;
        }
    },

    data: function() {
        return {
            selectedVal: null
        }
    },

    methods: {
        emitChange(val) {
            this.$emit('input', val)
        }
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
