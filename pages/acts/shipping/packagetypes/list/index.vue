<script>
import shipping_mixin from '@/mixins/shipping_mixin'

export default {
    middleware: [
        'authenticated'
    ],

    layout: 'admin',

    components: {
        IconTrash: () => import('@/components/icons/IconTrash'),
        IconPencil: () => import('@/components/icons/IconPencil')
    },

    mixins: [
        shipping_mixin
    ],

    data() {
        return {
            shippingPackageTypes: [],
            sortData: {
                orderBy: 'updated_at',
                orderDir: 'DESC'
            }
        }
    },

    async asyncData({ params, store, app }) {
        const shippingPackageTypes = await shipping_mixin.methods.getPackageTypes.call(app, {
            // where: ['is_available', '=', true],
            // andWhere: [
            //     ['total_inventory_count', '>', 0]
            // ],
            orderBy: 'updated_at',
            orderDir: 'DESC'
        });

        return {
            shippingPackageTypes
        }
    },

    methods: {
        async fetchPackageTypes() {
            try {
                this.shippingPackageTypes = await this.getPackageTypes({
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
                    this.$successMessage(`Package Type deleted: ${packageTypeJson.label}`)
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
        }
    }
}
</script>


<template>
    <div class="pal">

        <div class="tar mbl">
            <el-button type="primary" @click="goToPackageTypeUpsert()">ADD PACKAGE TYPE</el-button>
        </div>

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
                    <div>{{ scope.row.label }}</div>
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

                        <!-- operations -->
            <el-table-column
                label="Operations"
                align="center"
                width="150">
                <div slot-scope="scope" class="nowrap">
                    <el-button
                        type="primary"
                        round
                        @click="goToPackageTypeUpsert(scope.row.id)">
                        <icon-pencil
                            icon-name="edit"
                            class-name="fillWhite"
                            width="15px" />
                    </el-button>

                    <el-button
                        type="danger"
                        round
                        @click="deleteType(scope.row)"
                        class="mrl">
                        <icon-trash
                            icon-name="delete"
                            class-name="fillWhite"
                            width="15px" />
                    </el-button>
                </div>
            </el-table-column>
        </el-table>

    </div>
</template>
