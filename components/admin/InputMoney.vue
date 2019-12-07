<script>
import Vue from 'vue';
import {VMoney} from 'v-money';
import accounting from 'accounting';

// register directive v-money and component <money>
// Vue.use(money, {precision: 2})

export default{
    props: {
        value: {
            type: Number,
            default: null
        },

        maxlength: {
            type: Number,
            default: 14
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
                precision: 2,
                masked: false
            }
        }
    },

    directives: {
        money: VMoney
    },

    methods: {
        emitInput(val) {
            let clean = val ? val.toString().replace(new RegExp(this.money.thousands, 'g'), '') : 0;
            clean = accounting.toFixed(parseFloat(clean) * 100, 0);
            this.$emit('input', parseInt(clean, 10));
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
        v-model.lazy="selectedPrice"
        v-money="money"
        @input="emitInput"
        placeholder="0.00"
        :maxlength="maxlength"
        class="input-money">
        <template slot="prepend">$</template>
    </el-input>
</template>

<style lang="scss">
.input-money > .el-input-group__prepend {
    padding: 0 10px;
}
</style>
