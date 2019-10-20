<script>
import product_mixin from '@/mixins/product_mixin';
import variation_mixin from '@/mixins/variation_mixin';

export default {
    name: 'ProductVariationAdmin',

    components: {
        IconCheckSquare: () => import('@/components/icons/IconCheckSquare'),
        OperationsDropdown: () => import('@/components/OperationsDropdown'),
        VariationUpsertForm: () => import('@/components/product/admin/variation/VariationUpsertForm'),
    },

    props: {
        productId: {
            type: String,
            required: true
        }
    },

    mixins: [
        product_mixin,
        variation_mixin
    ],

    data() {
        return {
            product: {},
            variations: [],
            upsertModal: {
                isActive: false,
                variation: {}
            }
        }
    },

    methods: {


        async getVariations() {
            try {
                this.variations = await this.prodmix_variations(this.productId);
            }
            catch(e) {
                this.$errorMessage(
                    e.message,
                    { closeOthers: true }
                )
            }
        },

        async deleteVariation(variationObject) {
            try {
                await this.$confirm(`Remove variation "${ variationObject.name }" from the product?`, 'Please confirm', {
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                    type: 'warning'
                });

                try {
                    let variation = await this.varimix_delete(variationObject.id);

                    if(!variation) {
                        throw new Error(this.$t('Variation not found'));
                    }

                    this.getVariations();
                    this.$successMessage(`Variation deleted: ${variationObject.name }`)

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

        onDoUpsert(variation) {
            this.upsertModal.variation = variation || {};
            this.upsertModal.isActive = true;
        },

        onUpsertSaved(json) {
            this.upsertModal.isActive = false;
            this.getVariations();
        },

        onUpsertCancelled() {
            this.upsertModal.isActive = false;
            console.log("ON CANCELLED")
        }
    },

    watch: {
        productId: {
            handler(newVal) {
                if(newVal) {
                    this.getVariations();
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
            <el-button type="primary" @click="onDoUpsert()">ADD VARIATION</el-button>
        </div>

        <el-table
            :data="variations"
            class="widthAll">

            <el-table-column type="expand">
                <template slot-scope="scope">
                    <pre style="overflow-x:scroll">{{ scope.row | formatJson }}</pre>
                </template>
            </el-table-column>

            <!-- picture -->
            <el-table-column prop="name" label="Name">
                <template slot-scope="scope" v-if="getFeaturedPic(scope.row)">
                    <img :src="getFeaturedPic(scope.row)"
                        alt="Image"
                        class="prodPicSmall" />
                    <div class="fs12"># pictures: {{ scope.row.pics.length }}</div>
                </template>
            </el-table-column>

            <!-- name -->
            <el-table-column
                prop="name"
                label="Name" />

            <!-- sku -->
            <el-table-column
                prop="sku"
                label="SKU" />

            <!-- inventory count -->
            <el-table-column
                prop="inventory_count"
                label="Inventory"
                align="right">
                <template slot-scope="scope">
                    {{ $n(scope.row.inventory_count) }}
                </template>
            </el-table-column>

            <!-- weight -->
            <el-table-column
                prop="weight_oz"
                label="Weight (oz)"
                align="right" />

            <el-table-column
                fixed="right"
                align="right"
                width="50">
                <template slot-scope="scope">
                    <operations-dropdown
                        :show-view="false"
                        @edit="onDoUpsert(scope.row)"
                        @delete="deleteVariation(scope.row)" />
                </template>
            </el-table-column>
        </el-table>


        <el-dialog
            :title="upsertModal.variation.name ? 'EDIT: ' + $t(upsertModal.variation.name) : 'ADD VARIATION'"
            :visible.sync="upsertModal.isActive"
            :modal-append-to-body="false"
            :fullscreen="true">
            <variation-upsert-form
                :id="upsertModal.variation.id"
                :product-id="productId"
                @saved="onUpsertSaved"
                @cancelled="onUpsertCancelled" />
        </el-dialog>
    </div>
</template>


<style lang="scss" scoped>
@import "~assets/css/components/_formRow.scss";

.prodPicSmall {
    width: 70px;
}
</style>
