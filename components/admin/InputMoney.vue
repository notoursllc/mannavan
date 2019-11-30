<script>
import Vue from 'vue';
import {VMoney} from 'v-money';

// register directive v-money and component <money>
// Vue.use(money, {precision: 2})

export default{
    props: {
        value: {
            type: Number,
            default: null
        }
    },

    data: function() {
        return {
            selectedPrice: null,
            money: {
                decimal: '.',
                thousands: ',',
                prefix: '',
                suffix: '',
                precision: 2
            }
        }
    },

    directives: {
        money: VMoney
    },

    methods: {
        emitInput(val) {
            let clean = parseFloat(val);
            this.$emit('input', val * 100)
        }
    },

    watch: {
        'value' (to, from) {
            this.selectedPrice = to > 0 ? to/100 : 0;
        }
    },
}
</script>


<template>
    <el-input
        v-model="selectedPrice"
        v-money="money"
        @input="emitInput"
        placeholder="0.00"
        class="input-money">
        <template slot="prepend">$</template>
    </el-input>
</template>

<style lang="scss">
.input-money > .el-input-group__prepend {
    padding: 0 10px;
}
</style>
