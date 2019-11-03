<script>
import variation_mixin from '@/mixins/variation_mixin';
import option_mixin from '@/mixins/option_mixin';

export default {
    name: 'ProductVariationAdmin',

    components: {
        ProductDetailsJsonView: () => import('@/components/product/admin/ProductDetailsJsonView'),
        IconCheckSquare: () => import('@/components/icons/IconCheckSquare'),
        OperationsDropdown: () => import('@/components/OperationsDropdown'),
        // VariationUpsertForm: () => import('@/components/product/admin/variation/VariationUpsertForm'),
    },

    props: {
        variationId: {
            type: String,
            required: false
        }
    },

    mixins: [
        variation_mixin,
        option_mixin
    ],

    data() {
        return {
            options: [],
            upsertModal: {
                isActive: false,
                option: {
                    id: null,
                    name: null
                }
            }
        }
    },

    methods: {
        async getOptions() {
            try {
                this.options = await this.varimix_options(this.variationId);
            }
            catch(e) {
                this.$errorMessage(
                    e.message,
                    { closeOthers: true }
                )
            }
        },

        async deleteOption(optionObject) {
            try {
                await this.$confirm(`Remove option "${ optionObject.name }" from the variation?`, 'Please confirm', {
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                    type: 'warning'
                });

                try {
                    let option = await this.optmix_delete(optionObject.id);

                    if(!option) {
                        throw new Error(this.$t('Option not found'));
                    }

                    this.getOptions();
                    this.$successMessage(`Option deleted: ${optionObject.name }`)
                }
                catch(e) {
                    this.$errorMessage(
                        e.message,
                        { closeOthers: true }
                    )
                }
            }
            catch(err) {
                // do nothing when user cancels the delete
            }
        },

        onDoUpsert(option) {
            this.upsertModal.option.id = option ? option.id : null;
            this.upsertModal.option.name = option ? option.name : null;
            this.upsertModal.isActive = true;
        },

        onUpsertSaved(json) {
            this.upsertModal.isActive = false;
            this.getOptions();
        },

        onUpsertCancelled() {
            this.upsertModal.isActive = false;
        }
    },

    watch: {
        variationId: {
            handler(newVal) {
                if(newVal) {
                    this.getOptions();
                }
            },
            immediate: true,
        }
    }
}
</script>


<template>
    <div v-cloak>
        <div class="tar mbm">
            <el-button type="primary" @click="onDoUpsert()">ADD OPTION</el-button>
        </div>

        <el-table
            :data="options"
            class="widthAll">

            <el-table-column type="expand">
                <template slot-scope="scope">
                    <product-details-json-view :product="scope.row"></product-details-json-view>
                </template>
            </el-table-column>

            <!-- type -->
            <el-table-column
                prop="type"
                label="Type" />

            <!-- name -->
            <el-table-column
                prop="name"
                label="Name" />

            <!-- sku -->
            <el-table-column
                prop="sku"
                label="Sku" />

            <!-- inventory -->
            <el-table-column
                label="Inventory"
                width="120">
                <template slot-scope="scope">
                   {{ $n(scope.row.inventory_count) }}
                </template>
            </el-table-column>


            <!-- published -->
            <el-table-column
                label="Published"
                width="120">
                <template slot-scope="scope">
                    <icon-check-square
                        v-if="scope.row.published"
                        icon-name="checked"
                        class-name="fillGreen"
                        width="15px" />
                </template>
            </el-table-column>
        </el-table>


        <el-dialog
            :title="upsertModal.option.name ? 'EDIT: ' + $t(upsertModal.option.name) : 'ADD OPTION'"
            :visible.sync="upsertModal.isActive"
            :modal-append-to-body="false"
            :fullscreen="true">
            <!-- <variation-upsert-form
                :id="upsertModal.variation.id"
                :product-id="variationId"
                @saved="onUpsertSaved"
                @cancelled="onUpsertCancelled" /> -->
        </el-dialog>
    </div>
</template>


<style lang="scss" scoped>
@import "~assets/css/components/_formRow.scss";
</style>
