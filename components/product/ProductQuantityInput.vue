<script>
/**
 * The number of products that a user can purchase for a given size
 * is based on the inventory count of the given size.
 * This component prevents the user from purchasing more than the
 * inventory count for the given size
 */
export default {
    name: 'ProductQuantityInput',

    props: {
        value: {
            type: Number,
            default: 1
        },

        sizes: {
            type: Array,
            required: true
        },

        selectedSize: {
            type: String
        },

        menuSize: {
            type: String,
            required: false
        },

        stacked: {
            type: Boolean,
            default: true
        }
    },

    components: {
        NumberSelect: () => import('@/components/NumberSelect')
    },

    data: function() {
        return {
            selectedVal: null,
            maxValue: 30,
            minValue: 1,
            step: 1
        }
    },

    computed: {
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
            if(this.selectedSizeObject.hasOwnProperty('inventory_count')) {
                return parseInt(this.selectedSizeObject.inventory_count, 10) || 0;
            }
        },

        numberSelectClasses() {
            if(!this.stacked) {
                return 'width75 mrs'
            }
        },

        messageClasses() {
            const classes = [];

            if(this.menuSize === 'mini' || this.menuSize === 'small') {
                classes.push('fs12')
            }
            else {
                classes.push('fs16')
            }

            if(!this.stacked) {
                classes.push('inlineBlock')
            }

            return classes.join(' ');
        }
    },

    methods: {
        emitChange(val) {
            this.$emit('input', val)
        }
    },

    watch: {
        value: {
            handler: function(newVal) {
                this.selectedVal = newVal;
            },
            immediate: true,
        },

        selectedSize: {
            handler: function(newVal) {
                if(newVal) {
                    this.maxValue = this.selectedSizeInventoryCount;

                    if(this.maxValue < this.selectedVal) {
                        this.selectedVal = this.maxValue;
                    }

                    this.emitChange(this.selectedVal);
                }
            },
            immediate: true,
        }
    }
}
</script>


<template>
    <div class="inlineBlock">
        <number-select
            v-model="selectedVal"
            :min="minValue"
            :max="maxValue"
            :size="menuSize"
            placeholder=""
            :class="numberSelectClasses"
            @input="emitChange" />

        <div class="mts colorOrange"
            :class="messageClasses"
            v-if="selectedSizeInventoryCount > 0 && selectedSizeInventoryCount <= 10">
            <i18n path="only_num_left">
                <span place="qty">{{ selectedSizeInventoryCount }}</span>
            </i18n>
        </div>
    </div>
</template>


<style lang="scss" scoped>
    .el-input-number {
        width: 120px;
    }

    .numberButtons .el-button {
        border-radius: 0 !important;
    }

    .product-qty-input {
        width: 100%;

        input {
            text-align: center !important;
        }
    }
</style>
