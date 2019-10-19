<script>
import tax_mixin from '@/mixins/tax_mixin';

export default {
    middleware: [
        'authenticated'
    ],

    layout: 'admin',

    components: {
        OperationsDropdown: () => import('@/components/OperationsDropdown'),
        Fab: () => import('@/components/Fab')
    },

    mixins: [
        tax_mixin
    ],

    data() {
        return {
            taxes: [],
            sortData: {
                orderBy: 'updated_at',
                orderDir: 'DESC'
            }
        }
    },

    methods: {
        async fetchTaxes() {
            this.taxes = await this.taxmix_search({
                // where: ['is_available', '=', true],
                // whereRaw: ['sub_type & ? > 0', [productTypeId]],
                // andWhere: [
                //     ['total_inventory_count', '>', 0]
                // ],
                ...this.sortData
            });
        },

        sortChanged(val) {
            this.sortData.orderBy = val.prop || 'updated_at';
            this.sortData.orderDir = val.order === 'ascending' ? 'ASC' : 'DESC';
            this.fetchTaxes();
        },

        onAdd() {
            this.taxmix_goToUpsert();
        },

        async onDelete(tax) {
            try {
                await this.$confirm(`Delete "${ tax.name }"?`, 'Please confirm', {
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                    type: 'warning'
                });

                await this.taxmix_delete(tax.id);
                this.$successMessage(`"${ tax.name }" deleted successfully`);
                this.taxmix_goToList();
            }
            catch(err) {
                // Do nothing
            }
        },

        goToTaxUpsert(id) {
            this.taxmix_goToUpsert(id);
        }
    },

    created() {
        this.fetchTaxes();
    }
}
</script>


<template>
    <div>
        <fab type="add" @click="onAdd" />

        <el-table
            :data="taxes"
            class="widthAll"
            @sort-change="sortChanged">

            <el-table-column type="expand">
                <template slot-scope="scope">
                    <pre style="overflow-x:scroll">{{ scope.row | formatJson }}</pre>
                </template>
            </el-table-column>

            <!-- name -->
            <el-table-column
                label="Updated"
                prop="updated_at"
                sortable="custom">
                <template slot-scope="scope">
                    {{ scope.row.name }}
                    <operations-dropdown
                        :show-view="false"
                        @edit="goToTaxUpsert(scope.row.id)"
                        @delete="onDelete(scope.row)" />
                </template>
            </el-table-column>

            <!-- percentage -->
            <el-table-column
                label="Percentage"
                prop="percentage"
                sortable="custom">
            </el-table-column>
        </el-table>
    </div>
</template>


<style lang="scss">
    @import "~assets/css/components/_table.scss";
</style>
