<script>
export default {
    props: {
        destroyOnClose: {
            type: Boolean,
            default: true
        },
        closeOnClickModal: {
            type: Boolean,
            default: false
        },
        width: {
            type: String,
            default: '95%'
        },
        top: {
            type: String,
            default: '5vh'
        }
    }
}
</script>


<template>
    <el-dialog
        :destroy-on-close="destroyOnClose"
        :close-on-click-modal="closeOnClickModal"
        :width="width"
        :top="top"
        v-on="$listeners"
        v-bind="$attrs">
        <slot></slot>
    </el-dialog>
</template>
