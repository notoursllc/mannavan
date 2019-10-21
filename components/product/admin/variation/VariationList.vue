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
                variation: {
                    id: null,
                    name: null
                }
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
            this.upsertModal.variation.id = variation ? variation.id : null;
            this.upsertModal.variation.name = variation ? variation.name : null;
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

        <div class="inlineBlock" v-for="v in variations" :key="v.id" style="width:300px; padding: 0 10px;">
            <div class="card">
                <div class="card-image">
                    <img :src="getFeaturedPic(v)" />
                    <span class="card-title">
                        {{ v.name }}
                    </span>
                </div>
                <div class="card-content">
                    <div class="fab tac bgRed">
                        <operations-dropdown
                                :show-view="false"
                                @edit="onDoUpsert(v)"
                                @delete="deleteVariation(v)">
                            <i class="el-icon-more" />
                        </operations-dropdown>
                    </div>

                    <div class="displayTable">
                        <div class="formRow">
                            <label>SKU:</label>
                            <span>{{ v.sku }}</span>
                        </div>

                        <div class="formRow">
                            <label>Inventory:</label>
                            <span>{{ v.inventory_count }}</span>
                        </div>

                        <div class="formRow">
                            <label>Weight (oz):</label>
                            <span>{{ v.weight_oz }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

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
@import "~assets/css/components/_card.scss";

.card-image {
    height: 200px;
    background-color: #fff;
    overflow: hidden;
}

.bgRed {
    background-color: #F44336;
}
</style>
