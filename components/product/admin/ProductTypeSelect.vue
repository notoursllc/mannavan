<script>
export default{
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

            const types = Object.assign({}, this.$store.state.product.types);

            Object.keys(types).forEach((key) => {
                opts[this.$t(key)] = types[key].value;
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
            console.log("ON INPUT", val)
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
