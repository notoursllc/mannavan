<script>
import isObject from 'lodash.isobject';
import cloneDeep from 'lodash.clonedeep';
// import draggable from 'vuedraggable';
import uuid from 'uuid/v4';
import storage_mixin from '@/mixins/storage_mixin';

export default {
    name: 'SkuManager',

    props: {
        product: {
            type: Object
        },

        attributeSuggestions: {
            type: Array
        },

        maxNumCustomAttributes: {
            type: Number,
            default: 3
        }
    },

    components: {
        InputMoney: () => import('@/components/admin/InputMoney'),
        AppDialog: () => import('@/components/AppDialog'),
        SkuUpsertForm: () => import('@/components/product/admin/SkuUpsertForm'),
        draggable: () => import('vuedraggable'),
        IconDragHandle: () => import('@/components/icons/IconDragHandle'),
    },

    mixins: [
        storage_mixin
    ],

    data: function() {
        return {
            skuDialog: {
                show: false,
                action: 'append', // add / append
                sku: {
                    attributes: []
                }
            }
        }
    },

    computed: {
        showAddVariantButton() {
            return isObject(this.product) && this.product.id;
        },

        canAddColumn() {
            return Array.isArray(this.product.attributes) && (this.product.attributes.length < this.maxNumCustomAttributes);
        },

        canShowGrabHandles() {
            return Array.isArray(this.product.skus) && this.product.skus.length > 1;
        }
    },

    methods: {
        onClickMoreSkuInfo(index) {
            let sku = this.product.skus[index];

            this.skuDialog.sku = sku;
            this.skuDialog.action = 'append';
            this.skuDialog.show = true;
        },


        onSkuUpsertDone() {
            if(this.skuDialog.action === 'add') {
                this.product.skus.push(
                    cloneDeep(this.skuDialog.sku)
                );
            }

            this.resetSkuDialog();
            // console.log("DONE", this.product)
        },


        resetSkuDialog() {
            this.skuDialog.sku = {
                attributes: []
            };
            this.skuDialog.action = 'append';
            this.skuDialog.show = false;
        },


        async deleteSku(index) {
            try {
                const sku = this.product.skus[index];

                // Only delete the skus that are persisted in the DB (which have an id)
                if(sku.id) {
                    await this.$api.products.deleteSku(sku.id);
                }

                this.product.skus.splice(index, 1);

                if(sku.id) {
                    this.$successMessage(this.$t('Variant deleted successfully'));
                }
            }
            catch(e) {
                this.$errorMessage(
                    e.message,
                    { closeOthers: true }
                )
            }
        },


        onColumnMove(index, moveLeft) {
            const new_index = moveLeft ? index - 1 : index + 1;

            const removedAttrs = this.product.attributes.splice(index, 1);
            this.product.attributes.splice(new_index, 0, removedAttrs[0]);

            // the attributes in each sku need to be rearranged too:
            if(Array.isArray(this.product.skus)) {
                this.product.skus.forEach((sku) => {
                    let removed = sku.attributes.splice(index, 1);
                    sku.attributes.splice(new_index, 0, removed[0]);
                });
            }
        },


        onClickAddColumn() {
            const newAttribute = {
                label: null,
                id: uuid()
            };

            const suggestions = Array.isArray(this.attributeSuggestions) ? this.attributeSuggestions.slice(0) : [];  // copy the array

            // loop over all of the suggestions, and remove the ones that are already used
            if(suggestions.length) {
                let i = this.product.attributes.length;

                while (i--) {
                    // If this suggestion is already being used then remove it.
                    if(suggestions.indexOf(this.product.attributes[i].label) > -1) {
                        suggestions.splice(suggestions.indexOf(this.product.attributes[i].label), 1);
                    }
                }

                // Use the first suggestion that is still unused.
                newAttribute.label = suggestions[0] || null
            }


            this.product.attributes.push(newAttribute);

            // The product skus need to be updated as well with the new sku (variant)
            if(Array.isArray(this.product.skus)) {
                this.product.skus.forEach((sku) => {
                    sku.attributes.push({
                        optionId: newAttribute.id,
                        value: null
                    });
                });
            }
        },


        onClickDeleteColumn(index) {
            // Remove from device attributes
            const deletedAttributes = this.product.attributes.splice(index, 1);

            // The respective attribute needs to be removed from each sku as well:
            this.product.skus.forEach((sku) => {
                let i = sku.attributes.length;

                while (i--) {
                    if(sku.attributes[i].optionId === deletedAttributes[0].id) {
                        sku.attributes.splice(i, 1);
                    }
                }
            });
        },


        addEmptySku() {
            // each new sku needs to have it's attributes array pre-populated with the
            // existing attributes needed for the form
            const newSku = {
                attributes: [],
                product_id: this.product.id,
                ordinal: this.product.skus.length
            };

            if(Array.isArray(this.product.attributes)) {
                this.product.attributes.forEach((obj) => {
                    newSku.attributes.push({
                        optionId: obj.id,
                        value: null
                    })
                })
            }

            this.product.skus.push(newSku);
        },


        setOrdinals() {
            this.product.skus.forEach((obj, index) => {
                obj.ordinal = index;
            });
        },


        canShowLeftIcon(index) {
            return this.product.attributes[index - 1];
        },


        canShowRightIcon(index) {
            return this.product.attributes[index + 1];
        },
    },

    watch: {
        'product.skus': {
            handler(newVal) {
                if(Array.isArray(newVal) && !newVal.length) {
                    this.addEmptySku();
                }
            },
            immediate: true,
        }
    }
}
</script>


<template>
    <div style="overflow-x: scroll">
<!-- <div>product.skus: {{ product.skus }}</div> -->
<!-- <div>product.attribtues:{{ product.attributes }}</div> -->

        <table class="table">
            <thead>
                <tr>
                    <th class="vabtm" :class="{'width50': canAddColumn || canShowGrabHandles}">
                        <el-tooltip
                            v-if="canAddColumn"
                            effect="dark"
                            :content="$t('Add column')"
                            placement="top-start">
                            <el-button
                                @click="onClickAddColumn"
                                size="mini"
                                icon="el-icon-plus"></el-button>
                        </el-tooltip>
                    </th>

                    <template v-if="Array.isArray(product.attributes)">
                        <th
                            v-for="(obj, index) in product.attributes"
                            :key="index"
                            class="width125">
                            <div class="delete-icon">
                                <el-popconfirm
                                    :title="$t('Delete this column?')"
                                    :confirmButtonText="$t('OK')"
                                    :cancelButtonText="$t('cancel')"
                                    @onConfirm="onClickDeleteColumn(index)">
                                    <i slot="reference" class="el-icon-delete"/>
                                </el-popconfirm>
                            </div>

                            <el-input
                                v-model="product.attributes[index].label"
                                size="mini"
                                placeholder="Add column"
                                class="header-input">
                                <i slot="prepend"
                                    class="el-icon-back"
                                    v-if="canShowLeftIcon(index)"
                                    @click="onColumnMove(index, true)" />

                                <i slot="append"
                                    class="el-icon-right"
                                    v-if="canShowRightIcon(index)"
                                    @click="onColumnMove(index, false)" />
                            </el-input>
                        </th>
                    </template>

                    <th class="vabtm">{{ $t('Price') }}</th>
                    <th class="vabtm input-number">{{ $t('Quantity') }}</th>
                    <th class="vabtm">{{ $t('SKU') }}</th>
                    <th class="vabtm"></th>
                </tr>
            </thead>

            <draggable
                v-model="product.skus"
                handle=".handle"
                @update="setOrdinals"
                ghost-class="ghost"
                tag="tbody">
                <tr v-for="(obj, idx) in product.skus" :key="obj.id">
                    <!-- drag handle -->
                    <td>
                        <i class="handle cursorGrab" v-show="canShowGrabHandles">
                            <icon-drag-handle
                                icon-name="drag-handle"
                                width="15px"
                                class-name="fillGrayLight" />
                        </i>
                    </td>

                    <!-- custom attributes -->
                    <td v-for="attr in obj.attributes" :key="attr.optionId">
                        <el-input
                            v-model="attr.value" />
                    </td>

                    <!-- Price -->
                    <td>
                        <input-money v-model="obj.base_price" />
                    </td>

                    <!-- Qty -->
                    <td>
                        <el-input-number
                            v-model="obj.inventory_count"
                            :min="1"
                            :step="1"
                            controls-position="right"
                            step-strictly />
                    </td>

                    <!-- Sku -->
                    <td>
                        <el-input v-model="obj.sku" />
                    </td>

                    <td>
                        <el-button-group>
                            <el-button @click="onClickMoreSkuInfo(idx)">{{ $t('more') }}</el-button>

                            <el-popconfirm
                                :title="$t('Delete this row?')"
                                :confirmButtonText="$t('OK')"
                                :cancelButtonText="$t('cancel')"
                                @onConfirm="deleteSku(idx)">
                                <el-button slot="reference" icon="el-icon-delete"></el-button>
                            </el-popconfirm>
                        </el-button-group>
                    </td>
                </tr>
            </draggable>
        </table>


        <div class="pvl">
            <el-button
                type="primary"
                @click="addEmptySku"
                size="mini">{{ $t('Add row')}}</el-button>
        </div>


        <app-dialog :visible.sync="skuDialog.show">
            <sku-upsert-form
                :sku="skuDialog.sku"
                :product-attributes="product.attributes"
                @done="onSkuUpsertDone" />
        </app-dialog>
    </div>
</template>


<style lang="scss">
@import "~assets/css/components/_formRow.scss";
@import "~assets/css/components/_mixins.scss";

.el-popconfirm__action {
    margin-top: 10px;
}

.input-number {
    width: 105px;
}

.vertAlignBottom {
    vertical-align: bottom;
}

.ghost {
    opacity: 0.5;
    background: #c8ebfb;
}

.variant-label {
    word-wrap: break-word;
    word-break: break-word;
    overflow-wrap: break-word;
}

.header-input {
    .el-input-group__prepend,
    .el-input-group__append {
        padding: 0 3px;
        cursor: pointer;
    }
}

.delete-icon {
    text-align: center;
    margin-bottom: 3px;
    font-size: 16px;
    cursor: pointer;
}
</style>
