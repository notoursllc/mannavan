<script>
export default {
    name: 'OperationsDropdown',

    props: {
        showView: {
            type: Boolean,
            default: true,
        },

        showEdit: {
            type: Boolean,
            default: true,
        },

        showDelete: {
            type: Boolean,
            default: true,
        }
    },

    methods: {
        onCommand(command) {
            console.log("EMITTING", command)
            this.$emit(command);
        }
    }
}
</script>

<template>
    <el-dropdown @command="onCommand">
        <el-button size="mini">
            <i class="el-icon-arrow-down" />
        </el-button>
        <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="view" v-if="showView">View</el-dropdown-item>
            <el-dropdown-item command="edit" v-if="showEdit">Edit</el-dropdown-item>
            <el-dropdown-item command="delete" v-if="showDelete">Delete</el-dropdown-item>
        </el-dropdown-menu>
    </el-dropdown>
</template>

<style scoped>
.el-button--mini {
    padding: 4px !important;
    margin-left: 5px;
}
</style>
