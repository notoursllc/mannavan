<script>
import isObject from 'lodash.isobject';
import { getNextAvailableTypeValue } from '@/utils/common';

export default {
    middleware: [
        'authenticated'
    ],

    layout: 'admin',

    components: {
        AppDialog: () => import('@/components/AppDialog'),
        Fab: () => import('@/components/Fab'),
        TextCard: () => import('@/components/TextCard'),
        OperationsDropdown: () => import('@/components/OperationsDropdown'),
        BooleanTag: () => import('@/components/admin/BooleanTag')
    },

    data() {
        return {
            showDialog: false,
            collections: [],
            form: {
                name: null,
                value: null
            },
            domainName: process.env.DOMAIN_NAME
        }
    },

    methods: {
        async fetchCollections() {
            try {
                this.collections = await this.$api.products.listProductCollections();
            }
            catch(e) {
                this.$errorMessage(
                    e.message,
                    { closeOthers: true }
                )
            }
        },

        async onDeleteCollection(data) {
            try {
                await this.$confirm(this.$t('delete_name?', {'name': data.name}), this.$t('Please confirm'), {
                    confirmButtonText: this.$t('OK'),
                    cancelButtonText: this.$t('Cancel'),
                    type: 'warning'
                });

                try {
                    const collection = await this.$api.products.deleteProductCollection(data.id);

                    if(!collection) {
                        throw new Error(this.$t('Collection not found'));
                    }

                    this.fetchCollections();
                    this.$successMessage(this.$t('deleted_name', {'name':data.name}));
                    this.resetForm();
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

        async onClickAdd() {
            const collections = await this.$api.products.listProductCollections();
            this.form.published = true;
            this.form.value = getNextAvailableTypeValue(collections);
            this.showDialog = true;
        },


        async onUpsertClick(id) {
            try {
                const collection = await this.$api.products.getProductCollection(id);

                if(!collection) {
                    throw new Error(this.$t('Collection not found'));
                }

                this.form = collection;
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
                const collection = await this.$api.products.upsertProductCollection(this.form);

                if(!collection) {
                    throw new Error(this.$t('Error updating Collection'));
                }

                let title = collection.id ? this.$t('Collection updated successfully') : this.$t('Collection added successfully');
                this.$successMessage(`${title}: ${collection.name}`);

                this.showDialog = false;
                this.fetchCollections();
                this.resetForm();
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
            this.form = {
                name: null,
                value: null
            }
        }
    },

    created() {
        this.fetchCollections();
    }
}
</script>


<template>
    <div>
        <fab type="add" @click="onClickAdd" />

        <el-table
            :data="collections"
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
                        @edit="onUpsertClick(scope.row.id)"
                        @delete="onDeleteCollection(scope.row)" />
                </template>
            </el-table-column>

            <!-- Is Available -->
            <el-table-column
                prop="published"
                label="Published">
                <template slot-scope="scope">
                    <boolean-tag :value="scope.row.published" />
                </template>
            </el-table-column>
        </el-table>



        <app-dialog
            title="Edit Collection"
            :visible.sync="showDialog"
            width="40%">

            <!-- Available -->
            <div class="inputRow">
                <span>
                    <el-checkbox
                        v-model="form.published"
                        label="Published"
                        border />
                </span>
            </div>

            <!-- Name -->
            <div class="inputRow">
                <label>{{ $t('Name') }}:</label>
                <span>
                    <el-input v-model="form.name" />
                </span>
            </div>

            <!-- Description -->
            <div class="inputRow">
                <label>{{ $t('Description') }}:</label>
                <span>
                    <el-input
                        v-model="form.description"
                        type="textarea"
                        :rows="2" />
                </span>
            </div>

            <!-- Value -->
            <div class="inputRow">
                <label>{{ $t('Value') }}:</label>
                <span> {{ form.value }}</span>
            </div>

            <!-- SEO -->
            <text-card>
                <div slot="header">{{ $t('Search engine listing') }}</div>

                <!-- page title -->
                <div class="inputRow">
                    <label>{{ $t('Page title') }}:</label>
                    <span>
                        <el-input v-model="form.seo_page_title" />
                    </span>
                </div>

                <!-- description -->
                <div class="inputRow">
                    <label>{{ $t('Description') }}:</label>
                    <span>
                        <el-input
                            v-model="form.seo_page_desc"
                            type="textarea"
                            :rows="2" />
                    </span>
                </div>

                <!-- URI -->
                <div class="inputRow">
                    <label>{{ $t('URL and handle') }}:</label>
                    <span>
                        <el-input
                            v-model="form.seo_uri"
                            maxlength="50"
                            show-word-limit>
                            <template slot="prepend">https://{{ domainName }}/p/</template>
                        </el-input>
                    </span>
                </div>
            </text-card>

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
