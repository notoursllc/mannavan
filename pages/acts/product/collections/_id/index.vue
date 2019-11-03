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
    },

    mixins: [
        product_collection_mixin
    ],

    data() {
        return {
            dialog: {
                show: false,
                type: {}
            },
            collections: [],
            form: {
                name: null,
                slug: null
            },
        }
    },

    methods: {
        async fetchTypes() {
            try {
                this.collections = await this.prodCollMix_list();
            }
            catch(e) {
                this.$errorMessage(
                    e.message,
                    { closeOthers: true }
                )
            }
        },

        async onTypeDelete(data) {
            try {
                await this.$confirm(`Delete "${ data.name }"?`, 'Please confirm', {
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                    type: 'warning'
                });

                try {
                    const typeJson = await this.prodCollMix_delete(data.id);

                    if(!typeJson) {
                        throw new Error(this.$t('Collection not found'));
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
                    const type = await this.prodCollMix_get(data.id);

                    if(!type) {
                        throw new Error(this.$t('Collection not found'));
                    }

                    this.dialog.type = type;
                }
                else {
                    const types = await this.prodCollMix_list();
                    this.dialog.type = {
                        published: true,
                        value: getNextAvailableTypeValue(types)
                    };
                }

                this.dialog.show = true;
            }
            catch(e) {
                this.$errorMessage(
                    e.message,
                    { closeOthers: true }
                )
            }
        },

        async onUpsertFormSave(type) {
            try {
                const p = await this.prodCollMix_upsert(type);

                if(!p) {
                    throw new Error(this.$t('Error updating Collection'));
                }

                let title = type.id ? 'Collection updated successfully' : 'Collection successfully';
                this.$successMessage(`${title}: ${p.name}`);

                this.dialog.show = false;
                this.dialog.type = {};
                this.fetchTypes();
            }
            catch(e) {
                this.$errorMessage(
                    e.message,
                    { closeOthers: true }
                )
            }
        },

        onUpsertCancel() {
            this.dialog.show = false;
            this.dialog.type = {};
        },

        onFormCancel() {
            // this.$emit('cancel')
        },

        onFormSave() {
            // this.$emit('save', this.form)
        },

        onUseSlugSuggestion() {
            this.form.slug = this.slugIdea;
        }
    },

    created() {
        this.fetchTypes();
    }
}
</script>


<template>

    <div>
        PAGE TITLE GOES HERE

        <text-card class="box-card">
            <div slot="header">
                <span>Collection Info</span>
            </div>

            <slot>

                <!-- Available -->
                <div class="formRow">
                    <label>Published:</label>
                    <span>
                        <el-checkbox v-model="form.published" />
                    </span>
                </div>

                <!-- Name -->
                <div class="inputRow">
                    <label>Name:</label>
                    <span>
                        <el-input v-model="form.name" />
                    </span>
                </div>

                <!-- Value -->
                <div class="inputRow">
                    <label>Value:</label>
                    <span> {{ form.value }}</span>
                </div>

                <!-- Description -->
                <div class="inputRow">
                    <label>Description:</label>
                    <span>
                        <el-input
                            v-model="form.name"
                            type="textarea"
                            :rows="2" />
                    </span>
                </div>

                <!-- SEO page title -->
                <div class="inputRow">
                    <label>SEO page title:</label>
                    <span>
                        <el-input v-model="form.seo_page_title" />
                    </span>
                </div>

                <!-- SEO page description -->
                <div class="inputRow">
                    <label>SEO page description:</label>
                    <span>
                        <el-input
                            v-model="form.seo_page_desc"
                            type="textarea"
                            :rows="2" />
                    </span>
                </div>

                <!-- SEO URI -->
                <div class="inputRow">
                    <label>SEO URI:</label>
                    <span>
                        <el-input v-model="form.seo_uri" />
                    </span>
                </div>

                <!-- Sales Channel Type -->
                <div class="inputRow">
                    <label>Sales Channel Type:</label>
                    <span>
                        TODO: need SC type selector
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

            </slot>
        </text-card>

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
