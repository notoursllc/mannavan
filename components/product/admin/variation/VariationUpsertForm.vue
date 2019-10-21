<script>
import variation_mixin from '@/mixins/variation_mixin';

const formDefaults = {
    published: true,
    inventory_alert_threshold: 10,
    inventory_alert_show: true,
    hide_if_out_of_stock: true
};


export default {
    name: 'VariationUpsertForm',

    props: {
        id: {
            type: String,
            required: false
        },

        productId: {
            type: String,
            required: true
        }
    },

    mixins: [
        variation_mixin
    ],

    data() {
        return {
            variation: {
                ...formDefaults
            }
        }
    },

    methods: {
        async getVariation() {
            try {
                this.variation = await this.varimix_get(this.id);
            }
            catch(e) {
                this.$errorMessage(
                    e.message,
                    { closeOthers: true }
                )
            }
        },

        async onUpsertSave() {
            this.variation.product_id = this.productId;

            delete this.variation.options;
            delete this.variation.pics;

            try {
                let modelJson = await this.varimix_upsert(this.variation);
                this.$successMessage(this.id ? 'Add successful' : 'Update successful');
                this.$emit('saved', modelJson);
                this.resetData();
            }
            catch(e) {
                this.$errorMessage(
                    e.message,
                    { closeOthers: true }
                )
            }
        },

        onUpsertCancel() {
            this.resetData();
            this.$emit('cancelled');
        },

        resetData() {
            this.variation = {
                ...formDefaults
            }
        }
    },

    watch: {
        id: {
            handler(newVal) {
                if(newVal) {
                    this.getVariation();
                }
                else {
                    this.resetData();
                }
            },
            immediate: true,
        }
    }
}
</script>


<template>
    <div v-cloak class="mha displayTable">
        <!-- Published -->
        <div class="formRow">
            <label>Published:</label>
            <span>
                <el-checkbox v-model="variation.published" />
            </span>
        </div>

        <!-- Name -->
        <div class="formRow">
            <label>Name:</label>
            <span>
                <el-input v-model="variation.name" />
            </span>
        </div>

        <!-- Description -->
        <div class="formRow">
            <label>Description:</label>
            <span>
                <el-input
                    type="textarea"
                    :rows="2"
                    v-model="variation.description" />
            </span>
        </div>

        <!-- SKU -->
        <div class="formRow">
            <label>SKU:</label>
            <span>
                <el-input v-model="variation.sku" />
            </span>
        </div>

        <!-- Ordinal -->
        <div class="formRow">
            <label>Ordinal:</label>
            <span>
                <el-input-number
                    v-model="variation.ordinal"
                    controls-position="right"
                    :step="1" />
            </span>
        </div>

        <!-- Weight -->
        <div class="formRow">
            <label>Weight (oz):</label>
            <span>
                <el-input-number
                    v-model="variation.weight_oz"
                    controls-position="right"
                    :step=".1" />
            </span>
        </div>

        <!-- Inventory alert threshold -->
        <div class="formRow">
            <label>Inventory alert threshold:</label>
            <span>
                <el-input-number
                    v-model="variation.inventory_alert_threshold"
                    controls-position="right"
                    :step="1" />
            </span>
        </div>

        <!-- Inventory count -->
        <div class="formRow">
            <label>Inventory count:</label>
            <span>
                <el-input-number
                    v-model="variation.inventory_count"
                    controls-position="right"
                    :step="1" />
            </span>
        </div>

        <!-- Show inventory alert -->
        <div class="formRow">
            <label>Show inventory alert:</label>
            <span>
                <el-checkbox v-model="variation.inventory_alert_show" />
            </span>
        </div>

        <!-- Hide if out of stock -->
        <div class="formRow">
            <label>Hide if out of stock:</label>
            <span>
                <el-checkbox v-model="variation.hide_if_out_of_stock" />
            </span>
        </div>

        <!-- buttons -->
        <div class="formRow">
            <label></label>
            <span>
                <div class="ptl">
                    <el-button
                        type="primary"
                        class="mrm"
                        @click="onUpsertSave()">SAVE</el-button>

                    <el-button @click="onUpsertCancel()">CANCEL</el-button>
                </div>
            </span>
        </div>
    </div>
</template>


<style lang="scss" scoped>
@import "~assets/css/components/_formRow.scss";
</style>
