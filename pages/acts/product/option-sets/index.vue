<script>
import isObject from 'lodash.isobject';
import product_collection_mixin from '@/mixins/product_collection_mixin';
import { getNextAvailableTypeValue } from '@/utils/common';


export default {
    middleware: [
        'authenticated'
    ],

    layout: 'admin',

    components: {
        AppDialog: () => import('@/components/AppDialog'),
        Fab: () => import('@/components/Fab'),
        OperationsDropdown: () => import('@/components/OperationsDropdown'),
        TagsInput: () => import('@/components/admin/TagsInput'),
        PaginationBar: () => import('@/components/admin/PaginationBar'),
    },

    mixins: [
        product_collection_mixin
    ],

    data() {
        return {
            showDialog: false,
            optionSets: [],
            form: {},
            pagination: {}
        }
    },

    methods: {
        async fetchData() {
            try {
                let response = await this.$api.product_option_sets.list();
                this.optionSets = response.data;
                this.pagination = response.pagination;
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
                await this.$confirm(`Delete "${ data.internal_name }"?`, 'Please confirm', {
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                    type: 'warning'
                });

                try {
                    const typeJson = await this.$api.product_option_sets.delete(data.id);

                    if(!typeJson) {
                        throw new Error(this.$t('Item not found'));
                    }

                    this.fetchData();
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

        async onUpsertClick(data) {
            try {
                if(isObject(data) && data.id) {
                    const optionSet = await this.$api.product_option_sets.get(data.id);

                    if(!optionSet) {
                        throw new Error(this.$t('Item not found'));
                    }

                    this.form = optionSet;
                }
                else {
                    this.resetForm()
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
                const optionSet = await this.$api.product_option_sets.upsert(this.form);

                if(!optionSet) {
                    throw new Error(this.$t('Error updating Option Set'));
                }

                let title = optionSet.id ? this.$t('Option set updated successfully') : this.$t('Option set added successfully');
                this.$successMessage(`${title}: ${optionSet.internal_name}`);

                this.showDialog = false;
                this.resetForm();
                this.fetchData();
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
            this.resetForm();
        },

        resetForm() {
            this.form = {};
        }
    },

    created() {
        this.fetchData();
    }
}
</script>


<template>
    <div>
        <fab type="add" @click="onUpsertClick" />

        <pagination-bar
            :total="pagination.total" />

        <el-table
            :data="optionSets"
            class="widthAll">

            <el-table-column type="expand">
                <template slot-scope="scope">
                    <pre style="overflow-x:scroll">{{ scope.row | formatJson }}</pre>
                </template>
            </el-table-column>

            <!-- internal name -->
            <el-table-column
                prop="internal_name"
                label="Name">
                <template slot-scope="scope">
                    {{ scope.row.internal_name }}
                    <operations-dropdown
                        :show-view="false"
                        @edit="onUpsertClick(scope.row)"
                        @delete="onDeleteClick(scope.row)" />
                </template>
            </el-table-column>

            <!-- values -->
            <el-table-column
                label="Values">
                <template slot-scope="scope">
                    {{ Array.isArray(scope.row.option_values) ? scope.row.option_values.join((', ')) : '' }}
                </template>
            </el-table-column>
        </el-table>



        <app-dialog
            title="Edit Option Set"
            :visible.sync="showDialog"
            width="450px">
            <!-- Name -->
            <div class="inputRow">
                <label>Name:</label>
                <span>
                    <el-input v-model="form.internal_name" />
                </span>
            </div>

            <!-- Values -->
            <div class="inputRow">
                <label>Values:</label>
                <span>
                    <tags-input v-model="form.option_values" />
                </span>
            </div>

            <!-- buttons -->
            <div class="ptl">
                <el-button
                    type="primary"
                    @click="onFormSave">{{ $t('Save') }}</el-button>

                <el-button
                    @click="onFormCancel">{{ $t('Cancel') }}</el-button>
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
