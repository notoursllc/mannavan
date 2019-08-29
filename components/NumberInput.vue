<script>
export default {
    name: 'NumberInput',

    props: {
        value: {
            type: Number
        },

        max: {
            type: Number,
            default: 5
        },

        min: {
            type: Number,
            default: 1
        },

        step: {
            type: Number,
            default: 1
        },

        size: {
            type: String,
            required: false,
            default: 'medium'
        }
    },

    data() {
        return {
            selectedVal: this.min
        }
    },

    computed: {
        plusDisabled() {
            return this.max && this.selectedVal >= this.max;
        },
        minusDisabled() {
            return this.min && this.selectedVal <= this.min;
        },
    },

    methods: {
        emitVal() {
            if(this.selectedVal != this.value) {
                this.$emit('input', this.selectedVal);
            }
        },

        up() {
            this.setValue(this.selectedVal + this.step);
        },

        down() {
            this.setValue(this.selectedVal - this.step);
        },

        setValue(newVal, emit) {
            const parsed = parseInt(newVal, 10);
            const val = isNaN(parsed) ? this.min : parsed;

            if(this.max && (val > this.max)) {
                this.selectedVal = this.max;
            }
            else if(this.min && (val < this.min)) {
                this.selectedVal = this.min;
            }
            else {
                this.selectedVal = val;
            }

            if(emit !== false) {
                this.emitVal();
            }
        }
    },

    watch: {
        value: {
            handler(newVal) {
                if(newVal != null) {
                    const isFirstCall = this.selectedVal === null;
                    // console.log("VAL WATCH IS FIRST CALL", this.selectedVal)
                    this.setValue(newVal, false)

                    if(!isFirstCall) {
                        this.emitVal()
                    }
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
        @change="setValue"
        :max="max"
        :min="min"
        :step="step"
        :size="size"
        class="num-input">
        <template slot="prepend">
            <el-button
                type="info"
                @click="up"
                :disabled="plusDisabled"
                icon="el-icon-plus"
                class="nogrow" />
        </template>
        <template slot="append">
            <el-button
                type="info"
                @click="down"
                :disabled="minusDisabled"
                icon="el-icon-minus"
                class="nogrow" />
        </template>
    </el-input>
</template>


<style lang="scss">
.num-input .el-input__inner {
    text-align: center;
}
.num-input .el-button {
    padding: 12px;
}
</style>

