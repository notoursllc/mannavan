<script>
import isObject from 'lodash.isobject';
import product_type_mixin from '@/mixins/product_type_mixin';

export default {
    middleware: [
        'authenticated'
    ],

    layout: 'admin',

    components: {
        AppDialog: () => import('@/components/AppDialog'),
        ProductTypesTable: () => import('@/components/product/admin/ProductTypesTable'),
        Fab: () => import('@/components/Fab'),
        ProductTypeUpsertForm: () => import('@/components/product/admin/ProductTypeUpsertForm')
    },

    mixins: [
        product_type_mixin
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
                this.types = await this.getProductTypes();
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
                    const typeJson = await this.deleteProductType(data.id);

                    if(!typeJson) {
                        throw new Error(this.$t('Product type not found'));
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
                    const type = await this.getProductType(data.id);

                    if(!type) {
                        throw new Error(this.$t('Product Type not found'));
                    }

                    this.dialog.type = type;
                }
                else {
                    const types = await this.getProductTypes();
                    this.dialog.type = {
                        is_available: true,
                        value: this.getNextAvailableTypeValue(types)
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

        async onUpsertSuccess(type) {
            try {
                const p = await this.upsertProductType(this.dialog.type);

                if(!p) {
                    throw new Error(this.$t('Error updating Product Type'));
                }

                let title = this.dialog.type.id ? 'Product Type updated successfully' : 'Product Type added successfully';
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
        <fab type="add" @click="onUpsertClick" />

        <product-types-table
            :types="types"
            @edit="onUpsertClick"
            @delete="onTypeDelete" />

        <app-dialog
            :title="dialog.type.id ? 'Edit Product Type' : 'Add Product Type'"
            :visible.sync="dialog.show">
            <product-type-upsert-form
                :type="dialog.type"
                @save="onUpsertSuccess"
                @cancel="onUpsertCancel" />
        </app-dialog>
    </div>
</template>
