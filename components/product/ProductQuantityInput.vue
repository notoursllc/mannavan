<script>
/**
 * The number of products that a user can purchase for a given size
 * is based on the inventory count of the given size.
 * This component prevents the user from purchasing more than the
 * inventory count for the given size
 */
export default {
    name: 'ProductQuantityInput',

    inheritAttrs: false,

    props: {
        value: {
            type: Number,
            default: 1
        },

        min: {
            type: Number,
            default: 1
        },

        max: {
            type: Number,
            default: 1
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

    data: function() {
        return {
            selectedVal: null
        }
    },

    computed: {
        numberOptions: function() {
            let opts = [];
            for(var i = this.min; i <= this.max; i++) {
                opts.push(i);
            }
            return opts;
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

    watch: {
        value: {
            handler: function(newVal) {
                this.selectedVal = newVal;
            },
            immediate: true,
        }
    }
}
</script>


<template>
    <div class="inlineBlock widthAll">
        <el-select
            v-model="selectedVal"
            v-on="$listeners"
            class="widthAll"
            :class="numberSelectClasses"
            :size="menuSize">
            <el-option
                v-for="num in numberOptions"
                :key="num"
                :label="num"
                :value="num" />
        </el-select>

        <div class="mts colorOrange"
            :class="messageClasses"
            v-if="max > 0 && max <= 10">
            <i18n path="only_num_left">
                <span place="qty">{{ max }}</span>
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
