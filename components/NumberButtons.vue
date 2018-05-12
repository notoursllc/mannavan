<script>
import Vue from 'vue'
import { Button, ButtonGroup } from 'element-ui'

Vue.use(Button);
Vue.use(ButtonGroup);

export default {
    props: {
        min: {
            type: Number,
            default: 0,
            required: false
        },

        max: {
            type: Number,
            required: false
        },

        step: {
            type: Number,
            default: 1,
            required: false
        },

        size: {
            type: String,
            required: false
        },

        // this allows using the `value` prop for a different purpose
        initValue: {
            type: Number,
            default: 0
        },
    },

    computed: {
        buttonSize() {
            let sizes = ['large', 'small', 'mini'];

            if(this.size && sizes.indexOf(this.size) > -1) {
                return this.size;
            }

            return '';
        },

        plusDisabled() {
            return this.max && this.selectedVal >= this.max;
        },

        minusDisabled() {
            return this.min && this.selectedVal <= this.min;
        }
    },

    created() {
        this.selectedVal = this.setInRange(this.initValue);
        // this.emitVal();
    },

    methods: {
        setInRange(val) {
            let newVal = 0;

            if(this.min) {
                if(val >= this.min) {
                    newVal = val;
                }
            }
            else {
                newVal = val;
            }

            if(this.max) {
                if(val <= this.max) {
                    newVal = val;
                }
            }
            else {
                newVal = val;
            }

            return newVal;
        },

        up() {
            let tempVal = this.selectedVal + this.step;

            if(this.max) {
                if(tempVal <= this.max) {
                    this.selectedVal = tempVal;
                    this.emitVal();
                }
            }
            else {
                this.selectedVal = tempVal;
                this.emitVal();
            }
        },

        down() {
            let tempVal = this.selectedVal - this.step;

            if(this.min) {
                if(tempVal >= this.min) {
                    this.selectedVal = tempVal;
                    this.emitVal();
                }
            }
            else {
                this.selectedVal = tempVal;
                this.emitVal();
            }
        },

        emitVal() {
            this.$emit('change', this.selectedVal)
            // this.$emit('input', this.selectedVal)
        }
    },

    watch: {
        'initValue' (val) {
            this.selectedVal = this.setInRange(val);
        }
    },

    data() {
        return {
            selectedVal: null
        }
    }
}
</script>


<template>
    <div class="inlineBlock numberButtons">
        <el-button-group>
            <el-button icon="el-icon-plus" @click="up" :size="buttonSize" :disabled="plusDisabled"></el-button>
            <el-button icon="el-icon-minus" @click="down" :size="buttonSize" :disabled="minusDisabled"></el-button>
        </el-button-group>
    </div>
</template>


<style>
    .numberButtons .el-button {
        border-radius: 0 !important;
    }
</style>
