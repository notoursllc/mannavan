<script>
import shipping_mixin from '@/mixins/shipping_mixin'

export default {
    middleware: [
        'authenticated'
    ],

    layout: 'admin',

    components: {
        OperationsDropdown: () => import('@/components/OperationsDropdown'),
        Fab: () => import('@/components/Fab'),
        ShippingPackageTypeUpsertForm: () => import('@/components/shipping/ShippingPackageTypeUpsertForm')
    },

    mixins: [
        shipping_mixin
    ],

    data() {
        return {
            dialog: {
                show: false,
                packageTypeId: null
            },
            shippingPackageTypes: [],
            sortData: {
                orderBy: 'updated_at',
                orderDir: 'DESC'
            }
        }
    },

    methods: {
        async fetchPackageTypes() {
            try {
                this.shippingPackageTypes = await this.shipmix_getPackageTypes({
                    // where: ['is_available', '=', true],
                    // whereRaw: ['sub_type & ? > 0', [productTypeId]],
                    // andWhere: [
                    //     ['total_inventory_count', '>', 0]
                    // ],
                    ...this.sortData
                });
            }
            catch(e) {
                this.$errorMessage(
                    e.message,
                    { closeOthers: true }
                )
            }
        },

        sortChanged(val) {
            this.sortData.orderBy = val.prop || 'updated_at';
            this.sortData.orderDir = val.order === 'ascending' ? 'ASC' : 'DESC';
            this.fetchPackageTypes();
        },

        async deleteType(data) {
            try {
                await this.$confirm(`Remove this package type? "${ data.label }"`, 'Please confirm', {
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                    type: 'warning'
                });

                try {
                    const packageTypeJson = await this.deletePackageType(data.id);

                    if(!packageTypeJson) {
                        throw new Error(this.$t('Package Type not found'));
                    }

                    this.fetchPackageTypes();
                    this.$successMessage(`Package Type deleted: ${data.label}`)
                }
                catch(e) {
                    this.$errorMessage(
                        e.message,
                        { closeOthers: true }
                    )
                }
            }
            catch(err) {
                // Do nothing
            }
        },

        onUpsertClick(id) {
            this.dialog.packageTypeId = id || null;
            this.dialog.show = true;
        },

        onUpsertSuccess() {
            this.dialog.show = false;
            this.fetchPackageTypes();
        }
    },

    created() {
        this.fetchPackageTypes();
    }
}
</script>


<template>
    <div>
        <fab type="add" @click="onUpsertClick" />

        <el-table
            :data="shippingPackageTypes"
            class="widthAll"
            @sort-change="sortChanged">

            <el-table-column type="expand">
                <template slot-scope="scope">
                    <pre style="overflow-x:scroll">{{ scope.row | formatJson }}</pre>
                </template>
            </el-table-column>

            <!-- label -->
            <el-table-column
                prop="label"
                label="Label"
                sortable="custom">
                <template slot-scope="scope">
                    {{ scope.row.label }}
                    <operations-dropdown
                        :show-view="false"
                        @edit="onUpsertClick(scope.row.id)"
                        @delete="deleteType(scope.row)" />
                </template>
            </el-table-column>

            <!-- length -->
            <el-table-column
                prop="length"
                label="Length"
                sortable="custom">
            </el-table-column>

            <!-- width -->
            <el-table-column
                prop="width"
                label="Width"
                sortable="custom">
            </el-table-column>

            <!-- height -->
            <el-table-column
                prop="height"
                label="Height"
                sortable="custom">
            </el-table-column>

            <!-- distance unit -->
            <el-table-column
                prop="distance_unit"
                label="Distance Unit"
                sortable="custom">
            </el-table-column>

            <!-- weight -->
            <el-table-column
                prop="weight"
                label="Weight (oz)"
                sortable="custom">
            </el-table-column>
        </el-table>

        <el-dialog
            :visible.sync="dialog.show"
            :destroy-on-close="true"
            width="95%"
            top="5vh">
            <shipping-package-type-upsert-form
                :id="dialog.packageTypeId"
                @success="onUpsertSuccess"
                @cancel="dialog.show = false" />
        </el-dialog>

    </div>
</template>
