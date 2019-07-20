<script>
export default {
    props: {
        value: {
            type: Number,
            default: 0,
            required: false
        },

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
        }
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
            if(this.max && this.selectedVal >= this.max) {
                return true;
            }
            return false;
        },

        minusDisabled() {
            if(this.min && this.selectedVal <= this.min) {
                return true;
            }
            return false;
        }
    },

    methods: {
        /**
         * Sets the selected value to the max possible value if
         * the selected value is greater than max
         */
        capSelectedValue(newValue, maxValue) {
            // trim it down if the new value is > max allowed
            if(maxValue && newValue > maxValue) {
                this.selectedVal = maxValue;
            }
            else {
                this.selectedVal = newValue;
            }

            this.emitVal();
        },

        /**
         * Sets the selected value to the min possible value if
         * the selected value is less than min
         */
        floorSelectedValue(newValue, minValue) {
            if(minValue && newValue < minValue) {
                this.selectedVal = minValue;
            }
            else {
                this.selectedVal = newValue;
            }

            this.emitVal();
        },

        up() {
            let newValue = this.selectedVal + this.step;
            this.capSelectedValue(newValue, this.max)
        },

        down() {
            let newValue = this.selectedVal - this.step;
            this.floorSelectedValue(newValue, this.min);
        },

        emitVal() {
            if(this.selectedVal != this.value) {
                this.$emit('input', this.selectedVal)
            }
        }
    },

    data() {
        return {
            selectedVal: null
        }
    },

    watch: {
        value: {
            immediate: true,
            handler(newVal) {
                this.capSelectedValue(newVal, this.max);
                this.floorSelectedValue(newVal, this.min);
            }
        },
        max: {
            immediate: true,
            handler(newMax) {
                this.capSelectedValue(this.selectedVal, newMax);
            }
        },
        min: {
            immediate: true,
            handler(newMin) {
                this.floorSelectedValue(this.selectedVal, newMin);
            }
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
