<script>
import isObject from 'lodash.isobject';


export default {
    middleware: [
        'authenticated'
    ],

    layout: 'admin',

    components: {
        AppDialog: () => import('@/components/AppDialog'),
        Fab: () => import('@/components/Fab'),
        OperationsDropdown: () => import('@/components/OperationsDropdown'),
    },

    data() {
        return {
            showDialog: false,
            vendors: [],
            form: {
                name: null,
                description: null
            },
        }
    },

    methods: {
        async fetchVendors() {
            try {
                this.vendors = await this.$api.vendors.list();
            }
            catch(e) {
                this.$errorMessage(
                    e.message,
                    { closeOthers: true }
                )
            }
        },

        async onDeleteClick(data) {
            try {
                await this.$confirm(`Delete "${ data.name }"?`, 'Please confirm', {
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                    type: 'warning'
                });

                try {
                    const vendorData = await this.$api.vendors.delete(data.id);

                    if(!vendorData) {
                        throw new Error(this.$t('Vendor not found'));
                    }

                    this.fetchVendors();
                    this.$successMessage(`Deleted: ${data.name}`)
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

        async onAddClick() {
            this.form = {};
            this.showDialog = true;
        },

        async onUpsertClick(data) {
            try {
                if(isObject(data) && data.id) {
                    this.form = await this.$api.vendors.get(data.id);

                    if(!this.form) {
                        throw new Error(this.$t('Vendor not found'));
                    }
                }
                else {
                    this.form = {};
                }

                this.showDialog = true;
            }
            catch(e) {
                this.$errorMessage(
                    e.message,
                    { closeOthers: true }
                )
            }
        },

        async onFormSave() {
            try {
                const v = await this.$api.vendors.upsert(this.form);

                if(!v) {
                    throw new Error(this.$t('Error updating Vendor'));
                }

                let title = v.id ? 'Vendor updated successfully' : 'Vendor added successfully';
                this.$successMessage(`${title}: ${v.name}`);

                this.showDialog = false;
                this.form = {};
                this.fetchVendors();
            }
            catch(e) {
                this.$errorMessage(
                    e.message,
                    { closeOthers: true }
                )
            }
        },

        onFormCancel() {
            this.showDialog = false;
            this.form = {};
        }
    },

    created() {
        this.fetchVendors();
    }
}
</script>


<template>
    <div>
        <fab type="add" @click="onAddClick" />

        <el-table
            :data="vendors"
            class="widthAll">

            <el-table-column type="expand">
                <template slot-scope="scope">
                    <pre style="overflow-x:scroll">{{ scope.row | formatJson }}</pre>
                </template>
            </el-table-column>

            <!-- name -->
            <el-table-column
                prop="name"
                label="Name">
                <template slot-scope="scope">
                    {{ scope.row.name }}
                    <operations-dropdown
                        :show-view="false"
                        @edit="onUpsertClick(scope.row)"
                        @delete="onDeleteClick(scope.row)" />
                </template>
            </el-table-column>
        </el-table>


        <app-dialog
            :title="form.id ? 'Edit Vendor' : 'Add Vendor'"
            :visible.sync="showDialog"
            width="450px">

                <!-- Name -->
                <div class="inputRow">
                    <label>Name:</label>
                    <span>
                        <el-input v-model="form.name" />
                    </span>
                </div>

                <!-- Description -->
                <div class="inputRow">
                    <label>Description:</label>
                    <span>
                        <el-input
                            v-model="form.description"
                            type="textarea"
                            :rows="2" />
                    </span>
                </div>

                <!-- buttons -->
                <div class="ptl">
                    <el-button
                        type="primary"
                        @click="onFormSave">Save</el-button>

                    <el-button
                        @click="onFormCancel">Cancel</el-button>
                </div>
        </app-dialog>
    </div>
</template>


<style lang="scss">
    @import "~assets/css/components/_table.scss";
    @import "~assets/css/components/_formRow.scss";

    .formContainer {
        width: 500px;

        .formRow > label {
            white-space: nowrap;
        }

        .formRow > span {
            width: 100%;
        }
    }
</style>
