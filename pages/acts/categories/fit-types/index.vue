<script>
import isObject from 'lodash.isobject';
import product_type_mixin from '@/mixins/product_type_mixin';
import fit_type_mixin from '@/mixins/fit_type_mixin';

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
        product_type_mixin,
        fit_type_mixin
    ],

    data() {
        return {
            dialog: {
                show: false,
                type: {}
            },
            types: []
        }
    },

    methods: {
        async fetchTypes() {
            try {
                this.types = await this.fitmix_list();
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
                    const typeJson = await this.fitmix_delete(data.id);

                    if(!typeJson) {
                        throw new Error(this.$t('Fit type not found'));
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
                    const type = await this.fitmix_get(data.id);

                    if(!type) {
                        throw new Error(this.$t('Fit type not found'));
                    }

                    this.dialog.type = type;
                }
                else {
                    const types = await this.fitmix_list();
                    this.dialog.type = {
                        is_available: true,
                        value: this.prodTypeMix_getNextAvailableTypeValue(types)
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
                const p = await this.fitmix_upsert(type);

                if(!p) {
                    throw new Error(this.$t('Error updating Fit type'));
                }

                let title = type.id ? 'Fit type updated successfully' : 'Fit type added successfully';
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
        }
    },

    created() {
        this.fetchTypes();
    }
}
</script>


<template>
    <div>
        <!-- <fab type="add" @click="onUpsertClick" />

        <master-types-table
            :types="types"
            @edit="onUpsertClick"
            @delete="onTypeDelete" />

        <app-dialog
            :title="dialog.type.id ? 'Edit Fit type' : 'Add Fit type'"
            :visible.sync="dialog.show">
            <product-type-upsert-form
                :type="dialog.type"
                @save="onUpsertFormSave"
                @cancel="onUpsertCancel" />
        </app-dialog> -->
    </div>
</template>
