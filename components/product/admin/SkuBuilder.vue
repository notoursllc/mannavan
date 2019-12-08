<script>
import isObject from 'lodash.isobject';
import cloneDeep from 'lodash.clonedeep';
import uuid from 'uuid/v4';
import { stripTags, arrayDiff } from '../../../utils/common';


/**
 * Maps the option.values into variant groups
 *
 * @example
 * Converts this:
 * [ { "label": "Size", "values": [ "a" ] }, { "label": "Color", "values": [ "b", "c" ] }, { "label": "Material", "values": [ "e" ] } ]
 *
 * Into this:
 * [
 *     [ {objectId: IdForSize, value: "a"}, {objectId: IdForColor, value: "b"},  {objectId: IdForMaterial, value: "e"} ],
 *     [ {objectId: IdForSize, value: "a"}, {objectId: IdForColor, value: "c"},  {objectId: IdForMaterial, value: "e"} ],
 * ]
 */
function makeVariants(currentIndex, allOptions, collection) {
    let thisOption = allOptions[currentIndex];
    let newCollection = [];
    collection = Array.isArray(collection) ? collection : [];

    if(thisOption && Array.isArray(thisOption.values)) {
        if(!collection.length) {
            // the collection is empty so we don't need to combine
            // the values with any previous values: we can push them
            // directly onto newCollection:
            thisOption.values.forEach((val) => {
                newCollection.push([
                    {
                        optionId: thisOption.optionId,
                        value: val
                    }
                ])
            })
        }
        else {
            // for each option value, combine it with the previous collection values
            thisOption.values.forEach((val) => {
                collection.forEach((arr) => {
                    let newArray = cloneDeep(arr);
                    newArray.push({
                        optionId: thisOption.optionId,
                        value: val
                    });

                    newCollection.push(newArray)
                })
            })
        }
    }

    if(allOptions[currentIndex + 1]) {
        return makeVariants(currentIndex + 1, allOptions, newCollection)
    }

    return newCollection;
}



export default {
    name: 'SkuBuilder',

    props: {
        value: {
            type: Array
        },

        product: {
            type: Object
        },

        suggestions: {
            type: Array
        },

        maxCount: {
            type: Number,
            default: 3
        },

        optionData: {
            type: Array
        },
    },

    components: {
        ProductOptionValueSelect: () => import('@/components/product/admin/ProductOptionValueSelect'),
        SkuManager: () => import('@/components/product/admin/SkuManager')
    },

    data: function() {
        return {
            options: []
        }
    },

    computed: {
        canAddOption() {
            return this.options.length < this.maxCount;
        }
    },

    methods: {
        emitOptionsInput() {
            this.$emit('optionsInput', cloneDeep(this.options));
        },

        buildVariants() {
            let allValues = [];

            // Collecting the array of values from each of the options:
            this.options.forEach((obj) => {
                if(Array.isArray(obj.values) && obj.values.length) {
                    allValues.push( {
                        optionId: obj.id,
                        values: obj.values
                    } );
                }
            });

            const groups = makeVariants(0, allValues);
            let data = [];

            groups.forEach((arr) => {
                // if this set of values already exists in this.variantData then copy the object
                // instead of creating a new one, otherwise any previous user-entered values will be wiped out
                let valueString = JSON.stringify(arr);
                let matched = null;

                this.product.skus.forEach((obj) => {
                    if(valueString === JSON.stringify(obj.attributes)) {
                        matched = obj;
                    }
                });

                if(matched) {
                    data.push(matched);
                }
                else {
                    data.push({
                        // id: uuid(),
                        attributes: arr
                    });
                }
            });

            this.product.skus = cloneDeep(data);
        },


        onAddOptionClick() {
            let suggestions = Array.isArray(this.suggestions) ? this.suggestions.slice(0) : [];  // copy the array

            if(suggestions.length) {
                let i = this.options.length;
                while (i--) {
                    if(suggestions.indexOf(this.options[i].label) > -1) {
                        suggestions.splice(suggestions.indexOf(this.options[i].label), 1);
                    }
                }

                this.options.push(
                    {
                        label: suggestions[0] || null,
                        values: [],
                        tempValues: [],
                        type: 'OPTION_TYPE_SELECT_ONE',
                        id: uuid()
                    }
                );
            }
            else {
                this.options.push(
                    {
                        label: null,
                        values: [],
                        tempValues: [],
                        type: 'OPTION_TYPE_SELECT_ONE',
                        id: uuid()
                    }
                );
            }
        },


        onClickDeleteRow(index) {
            this.options.splice(index, 1);
            this.emitOptionsInput();
        },


        async optionValueConfirm(index) {
            let diff = arrayDiff(this.options[index].values, this.options[index].tempValues);

            if(this.options[index].tempValues.length < this.options[index].values.length && diff.length) {
                try {
                    await this.$confirm(
                        this.$t('warning_message_remove_product_option_tag'),
                        this.$t('Please confirm'),
                        {
                            center: true,
                            confirmButtonText: this.$t('OK'),
                            cancelButtonText: this.$t('Cancel'),
                            dangerouslyUseHTMLString: true,
                            type: 'warning',
                            lockScroll: false
                        }
                    );

                    this.options[index].values = cloneDeep(this.options[index].tempValues);
                }
                catch(err) {
                    this.options[index].tempValues = cloneDeep(this.options[index].values);
                }
            }
            else {
                this.options[index].values = cloneDeep(this.options[index].tempValues);
            }

            this.emitOptionsInput();
        },


        onOptionValueMenuVisible(index, isVisible) {
            if(isVisible) {
                return;
            }

            return this.optionValueConfirm(index);
        },


        onOptionValueRemoveTag(index, tag) {
            return this.optionValueConfirm(index);
        },


        async onOptionsChange(index, val) {
            this.options.forEach((obj) => {
                obj.values = cloneDeep(obj.tempValues)
            })
            this.emitOptionsInput();
        }
    },

    watch: {
        optionData: {
            handler(newVal) {
                if(Array.isArray(newVal)) {
                    this.options = newVal;

                    this.options.forEach((obj) => {
                        obj.tempValues = cloneDeep(obj.values)
                    });

                    this.buildVariants();
                }
            },
            immediate: true
        },
    }
}
</script>


<template>
    <div>

        <table class="table">
            <tr>
                <th>{{ $t('Options') }}</th>
                <th>{{ $t('Values') }}</th>
                <th></th>
            </tr>

            <tr v-for="(obj, index) in options" :key="index">
                <td class="vat option-row-option">
                    <el-input
                        v-model="obj.label"
                        placeholder="Option name"
                        @input="onOptionsChange" />
                </td>

                <td class="vat">
                    <product-option-value-select
                        v-model="obj.tempValues"
                        @visible-change="(isVisible) => { onOptionValueMenuVisible(index, isVisible) }"
                        @remove-tag="(tag) => { onOptionValueRemoveTag(index, tag) }"
                        :key="index" />
                </td>

                <td class="vat tar">
                    <i @click="onClickDeleteRow(index)"
                        class="el-icon-delete option-delete-icon"
                        :alt="$t('Remove')" />
                </td>
            </tr>
        </table>

        <div class="mtl" v-show="canAddOption">
            <el-button
                type="primary"
                size="small"
                @click="onAddOptionClick">{{ $t('Add Option') }}</el-button>
        </div>

        <div class="sku-preview" v-show="options.length">
            <div class="pvm"><hr/></div>

            <h4>{{ $t('Variants') }}</h4>

            <sku-manager
                :product="product"
                :details-view="true" />
        </div>

    </div>
</template>


<style lang="scss">
.option-delete-icon {
    cursor: pointer;
    line-height: 40px;
    font-size: 20px;
}

.sku-preview {
    margin-top: 20px;

    h4 {
        font-weight: 500;
    }

    .variant-label {
        word-wrap: break-word;
        word-break: break-word;
        overflow-wrap: break-word;
    }
}

.input-number {
    width: 105px;
}
</style>
