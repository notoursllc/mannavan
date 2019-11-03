<script>
import isObject from 'lodash.isobject';
import { slugSuggestion } from '@/utils/common';

export default {
    name: 'MasterTypesManager',

    props: {
        object: {
            type: String,
            required: true
        }
    },

    components: {
        AppDialog: () => import('@/components/AppDialog'),
        Fab: () => import('@/components/Fab'),
        OperationsDropdown: () => import('@/components/OperationsDropdown'),
        BooleanTag: () => import('@/components/admin/BooleanTag')
    },

    data() {
        return {
            showDialog: false,
            form: {
                name: null,
                slug: null,
                published: true
            },
            types: []
        }
    },

    computed: {
        slugIdea() {
            return slugSuggestion(this.form.name)
        }
    },

    methods: {
        async fetchTypes() {
            try {
                this.types = await this.$api.masterTypes.list(this.object);
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
                    const typeJson = await this.$api.masterTypes.delete(data.id);

                    if(!typeJson) {
                        throw new Error(this.$t('Master type not found'));
                    }

                    this.fetchTypes();
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
                    const type = await this.$api.masterTypes.get(data.id);

                    if(!type) {
                        throw new Error(this.$t('Master Type not found'));
                    }

                    Object.keys(type).forEach((key) => {
                        this.form[key] = type[key];
                    });
                }
                else {
                    const types = await this.$api.masterTypes.list(this.object);
                    this.form.published = true;
                    this.form.value = this.$api.masterTypes.getNextAvailableTypeValue(types);
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

        clearForm() {
            Object.keys(this.form).forEach((key) => {
                if(key !== 'object') {
                    this.form[key] = null;
                }
            })
        },

        async onUpsertFormSave() {
            try {
                this.form.object = this.object;
                const mt = await this.$api.masterTypes.upsert(this.form);

                if(!mt) {
                    throw new Error(this.$t('Error updating Master Type'));
                }

                let title = this.form.id ? 'Master Type updated successfully' : 'Master Type added successfully';
                this.$successMessage(`${title}: ${mt.name}`);

                this.showDialog = false;
                this.clearForm();
                this.fetchTypes();
            }
            catch(e) {
                this.$errorMessage(
                    e.message,
                    { closeOthers: true }
                )
            }
        },

        onUpsertFormCancel() {
            this.showDialog = false;
            this.clearForm();
        },

        onUseSlugSuggestion() {
            this.form.slug = this.slugIdea;
        }
    },

    created() {
        this.fetchTypes();
    },

    watch: {
        'object': {
            handler(newVal) {
                this.form.object = newVal;
            },
            immediate: true
        },
    },
}
</script>


<template>
    <div>
        <fab type="add" @click="onUpsertClick" />

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
                        @edit="onUpsertClick(scope.row)"
                        @delete="onDeleteClick(scope.row)" />
                </template>
            </el-table-column>

            <!-- Slug -->
            <el-table-column
                prop="slug"
                label="Slug" />

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
            :key="object"
            :title="form.id ? `Edit Master Type (${object})` : `Add Master Type (${object})`"
            :visible.sync="showDialog">

            <div class="displayTable widthAll">

                <!-- Available -->
                <div class="formRow">
                    <label class="width100">Published:</label>
                    <span>
                        <el-checkbox v-model="form.published" />
                    </span>
                </div>

                <!-- Name -->
                <div class="formRow">
                    <label>Name:</label>
                    <span>
                        <el-input v-model="form.name" />
                    </span>
                </div>

                <!-- Slug -->
                <div class="formRow">
                    <label>Slug:</label>
                    <span>
                        <el-input v-model="form.slug" />
                        <div class="fs12" v-show="slugIdea">
                            <span class="colorGrayLighter">Suggestion:</span>&nbsp;&nbsp;{{ slugIdea }}&nbsp;&nbsp;(<a @click="onUseSlugSuggestion">use this</a>)
                        </div>
                    </span>
                </div>

                <!-- Value -->
                <div class="formRow">
                    <label>Value:</label>
                    <span> {{ form.value }}</span>
                </div>

                <!-- buttons -->
                <div class="formRow">
                    <label></label>
                    <span class="ptl">
                        <el-button
                            type="primary"
                            @click="onUpsertFormSave">Save</el-button>

                        <el-button
                            @click="onUpsertFormCancel">Cancel</el-button>
                    </span>
                </div>

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
