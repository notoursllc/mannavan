<script>
export default {
    name: 'ProductTypesTable',

    middleware: [
        'authenticated'
    ],

    layout: 'admin',

    props: {
        types: {
            type: Array,
            default: []
        }
    },

    components: {
        OperationsDropdown: () => import('@/components/OperationsDropdown'),
        BooleanTag: () => import('@/components/admin/BooleanTag')
    },

    methods: {
        onEditClick(id) {
            this.$emit('edit', id)
        },

        onDeleteClick(id) {
            this.$emit('delete', id)
        }
    }
}
</script>


<template>
    <el-table
        :data="types"
        class="widthAll">

        <el-table-column type="expand">
            <template slot-scope="scope">
                <pre style="overflow-x:scroll">{{ scope.row | formatJson }}</pre>
            </template>
        </el-table-column>

        <!-- label -->
        <el-table-column
            prop="name"
            label="Name">
            <template slot-scope="scope">
                {{ scope.row.name }}
                <operations-dropdown
                    :show-view="false"
                    @edit="onEditClick(scope.row)"
                    @delete="onDeleteClick(scope.row)" />
            </template>
        </el-table-column>

        <!-- Value -->
        <el-table-column
            prop="value"
            label="Value" />

        <!-- Slug -->
        <el-table-column
            prop="slug"
            label="Slug" />

        <!-- Is Available -->
        <el-table-column
            prop="is_available"
            label="Available">
            <template slot-scope="scope">
                <boolean-tag :value="scope.row.is_available" />
            </template>
        </el-table-column>
    </el-table>
</template>
