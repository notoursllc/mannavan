<script>
import isObject from 'lodash.isobject'

export default {
    props: {
        success: {
            type: Boolean,
            default: false
        },
        failed: {
            type: Boolean,
            default: false
        },
        className: {
            // type: String,
            default: 'widthAll'
        }
    },

    components: {
        IconCheckSquare: () => import('@/components/icons/IconCheckSquare'),
        IconTimesSquare: () => import('@/components/icons/IconTimesSquare')
    },

    computed: {
        showSuccessIcon() {
            return this.success;
        },
        showFailureIcon() {
            return !this.success && this.failed;
        },
        cssClass() {
            let obj = {};
            let self = this;

            if(isObject(self.className)) {
                obj = Object.assign({}, this.className);
            }
            else {
                obj[self.className] = true;
            }

            obj['el-input__failed'] = this.showFailureIcon;

            return Object.assign({}, obj);
        }
    }
}
</script>

<template>
    <div class="inlineBlock relative" :class="cssClass">
        <slot></slot>
        <icon-check-square
            v-show="showSuccessIcon"
            icon-name="checkmark"
            class-name="fillGreen"
            width="14px"
            class="status-icon" />
        <icon-times-square
            v-show="showFailureIcon"
            icon-name="times"
            class-name="fillRed"
            width="14px"
            class="status-icon" />
    </div>
</template>

<style lang="scss" scoped>
    .status-icon {
        position: absolute;
        top: 0;
        right: 0;
    }
</style>
