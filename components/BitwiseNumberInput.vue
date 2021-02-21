<script>
export default {
    name: 'BitwiseNumberInput',

    props: {
        value: {
            type: Number
        },

        size: {
            type: String,
            required: false,
            default: 'medium'
        }
    },

    data() {
        return {
            selectedVal: null,
            step: 0
        }
    },

    methods: {
        emitVal() {
            if(this.selectedVal != this.value) {
                this.$emit('input', this.selectedVal);
            }
        },

        up() {
            this.step++;
            this.setValueFromStep();
        },

        down() {
            if(this.step > 0) {
                this.step--;
                this.setValueFromStep();
            }
        },

        setValueFromStep(emit) {
            this.selectedVal = Math.pow(2, parseInt(this.step, 10));

            if(emit !== false) {
                this.emitVal();
            }
        },

        getStepFromValue(value) {
            let val = parseInt(value);

            if(isNaN(val)) {
                return this.step;
            }

            // https://stackoverflow.com/questions/4016213/whats-the-opposite-of-javascripts-math-pow
            return ( parseInt(Math.log(val) / Math.log(2), 10) );
        },

        onInputChange(val) {
            this.step = this.getStepFromValue(val);
            this.setValueFromStep();
        }
    },

    watch: {
        value: {
            handler(newVal) {
                if(newVal != null) {
                    const isFirstCall = this.selectedVal === null;

                    this.step = this.getStepFromValue(newVal);
                    this.setValueFromStep(!isFirstCall)
                }
            },
            immediate: true
        }
    }
}
</script>


<template>
    <el-input
        v-model="selectedVal"
        @change="onInputChange"
        :size="size"
        class="num-input">
        <template slot="prepend">
            <el-button
                type="info"
                @click="up"
                icon="el-icon-plus"
                class="nogrow" />
        </template>
        <template slot="append">
            <el-button
                type="info"
                @click="down"
                icon="el-icon-minus"
                class="nogrow" />
        </template>
    </el-input>
</template>


<style>
.num-input .el-input__inner {
    text-align: center;
}
.num-input .el-button {
    padding: 12px;
}
</style>

