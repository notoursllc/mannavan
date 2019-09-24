<script>
export default {
    name: 'BooleanTag',

    inheritAttrs: false,

    props: {
        value: {
            type: Boolean
        }
    },

    computed: {
        label() {
            return this.value ? "Yes" : "No"
        },

        tagType() {
            return this.value ? 'success' : 'danger'
        }
    }
}
</script>

<template>
    <el-tag
        :type="tagType"
        v-on="$listeners"
        v-bind="$attrs">{{ label }}</el-tag>
</template>
