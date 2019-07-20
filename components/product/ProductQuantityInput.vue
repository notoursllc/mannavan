<script>
/**
 * The number of products that a user can purchase for a given size
 * is based on the inventory count of the given size.
 * This component prevents the user from purchasing more than the
 * inventory count for the given size
 */

import isObject from 'lodash.isobject';


export default {
    name: 'ProductQuantityInput',

    props: {
        value: {
            default: null
        },

        sizes: {
            type: Array,
            required: true
        },

        selectedSize: {
            type: String
        },

        buttonSize: {
            type: String,
            required: false
        }
    },

    data: function() {
        return {
            selectedVal: null,
            maxValue: 0,
            minValue: 1,
            step: 1
        }
    },

    computed: {
        btnSize() {
            let sizes = ['large', 'small', 'mini'];

            if(this.buttonSize && sizes.indexOf(this.buttonSize) > -1) {
                return this.buttonSize;
            }

            return 'large';
        },

        plusDisabled() {
            if(this.maxValue && this.selectedVal >= this.maxValue) {
                return true;
            }
            return false;
        },

        minusDisabled() {
            if(this.minValue && this.selectedVal <= this.minValue) {
                return true;
            }
            return false;
        },

        selectedSizeObject() {
            let obj = {};

            if(this.selectedSize && Array.isArray(this.sizes)) {
                this.sizes.forEach((size) => {
                    if(this.selectedSize === size.size) {
                        obj = size;
                    }
                });
            }

            return obj;
        },

        selectedSizeInventoryCount() {
            return parseInt(this.selectedSizeObject.inventory_count, 10) || 0;
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
        },

        up() {
            let newValue = this.selectedVal + this.step;

            this.capSelectedValue(newValue, this.maxValue);
            this.emitVal();
        },

        down() {
            let newValue = this.selectedVal - this.step;

            this.floorSelectedValue(newValue, this.minValue);
            this.emitVal();
        },

        emitVal() {
            if(this.selectedVal != this.value) {
                this.$emit('input', this.selectedVal)
            }
        }
    },

    watch: {
        value: {
            immediate: true,
            handler(newVal) {
                if(newVal != null) {
                    const isFirstCall = this.selectedVal === null;
                    // console.log("VAL WATCH IS FIRST CALL", this.selectedVal)

                    this.capSelectedValue(newVal, this.maxValue);
                    this.floorSelectedValue(newVal, this.minValue);

                    if(!isFirstCall) {
                        this.emitVal()
                    }
                }
            }
        },

        // When the selectedSize changes the maxValue may have to be reduced
        selectedSize: {
            immediate: true,
            handler(value) {
                this.maxValue = this.selectedSizeInventoryCount;
                // console.log("SELETED SIZE CHANGE - NEW MAX", this.maxValue)

                this.capSelectedValue(this.selectedVal, this.maxValue);
                this.emitVal();
            }
        }
    }
}
</script>


<template>
    <div class="inlineBlock">
        <div class="numberButtons">
            <el-button-group>
                <el-button icon="el-icon-plus" @click="up" :size="btnSize" :disabled="plusDisabled"></el-button>
                <el-button icon="el-icon-minus" @click="down" :size="btnSize" :disabled="minusDisabled"></el-button>
            </el-button-group>
        </div>

        <div class="mts colorOrange" v-if="selectedSizeInventoryCount > 0 && selectedSizeInventoryCount <= 10">
            <i18n path="only_num_left">
                <span place="qty">{{ selectedSizeInventoryCount }}</span>
            </i18n>
        </div>
    </div>
</template>


<style scoped>
    .el-input-number {
        width: 120px;
    }

    .numberButtons .el-button {
        border-radius: 0 !important;
    }
</style>
