<script>
import IconCheckSquare from '@/components/icons/IconCheckSquare'
import IconTimesSquare from '@/components/icons/IconTimesSquare'

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
            type: String,
            default: 'widthAll'
        }
    },

    components: {
        IconCheckSquare,
        IconTimesSquare
    },

    computed: {
        showSuccessIcon() {
            return this.success;
        },
        showFailureIcon() {
            return !this.success && this.failed;
        }
    }
}
</script>

<template>
    <div class="inlineBlock relative" :class="className">
        <slot></slot>
        <icon-check-square
            v-show="showSuccessIcon"
            icon-name="checkmark"
            class-name="fillGreen"
            width="20px"
            class="status-icon" />
        <icon-times-square
            v-show="showFailureIcon"
            icon-name="times"
            class-name="fillRed"
            width="20px"
            class="status-icon" />
    </div>
</template>

<style scoped>
    .status-icon {
        position: absolute;
        top: -7px;
        right: -16px;
    }
</style>
