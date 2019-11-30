<script>
import isObject from 'lodash.isobject';
import cloneDeep from 'lodash.clonedeep';
import uuid from 'uuid/v4';


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

        suggestions: {
            type: Array
        },

        maxCount: {
            type: Number,
            default: 3
        }
    },

    components: {
        ProductOptionValueSelect: () => import('@/components/product/admin/ProductOptionValueSelect'),
        InputMoney: () => import('@/components/admin/InputMoney')
    },

    data: function() {
        return {
            options: [],
            variantData: []
        }
    },

    computed: {
        canAddOption() {
            return this.options.length < this.maxCount;
        }
    },

    methods: {
        emitInput() {
            const attrs = [];

            this.options.forEach((obj) => {
                attrs.push(obj.label);
            })

            this.$emit('input', attrs);
        },

        buildVariants(index) {
            let allValues = [];

            // Collecting the array of values from each of the options:
            this.options.forEach((obj) => {
                if(Array.isArray(obj.values) && obj.values.length) {
                    // allValues.push( obj.values );
                    allValues.push( {
                        optionId: obj.id,
                        values: obj.values
                    } );
                }
            });

            // console.log("buildVariants - allValues", allValues)

            const groups = makeVariants(0, allValues);

            this.variantData = [];
            let data = [];

            groups.forEach((arr) => {
                data.push({
                    values: arr,
                    price: null,
                    quantity: null,
                    sku: null,
                    barcode: null,
                    published: true,
                    id: uuid()
                })
            });

            // TODO:  need to add/remove values from this.variantData
            // instead of setting this.variantData = []
            // because doing so wipes out existing form values

            this.variantData = cloneDeep(data);
            // return this.variantData;
        },

        onInputChange() {
            this.emitInput();
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
                        type: 'OPTION_TYPE_SELECT_ONE',
                        id: uuid()
                    }
                );
            }
        },

        onClickDeleteRow(index) {
            this.options.splice(index, 1);
            this.buildVariants(index);
            this.emitInput();
        },

        onOptionValueChange(val, index) {
            this.buildVariants(index);
        },

        getVariantOptionValue(optionId, variant) {
            let val = null;

            variant.values.forEach((obj) => {
                if(obj.optionId === optionId) {
                    val = obj.value;
                }
            });

            return val;
        }
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
                        @input="onInputChange" />
                </td>

                <td class="vat">
                    <product-option-value-select
                        v-model="obj.values"
                        @input="onOptionValueChange(obj.values, index)"
                        :key="index" />
                </td>

                <td class="vat tar">
                    <el-button
                        @click="onClickDeleteRow(index)"
                        size="small"
                        type="text">{{ $t('Remove') }}</el-button>
                </td>
            </tr>
        </table>

        <div class="mtl" v-show="canAddOption">
            <el-button
                type="primary"
                size="small"
                @click="onAddOptionClick">{{ $t('Add Option') }}</el-button>
        </div>

        <div class="pvm"><hr/></div>

        <div class="sku-preview" v-show="options.length">
            <h4>{{ $t('Preview') }}</h4>

            <el-table
                :data="variantData"
                class="widthAll">

                <el-table-column
                    v-for="(obj, index) in options" :key="index">
                    <template slot="header" slot-scope="scope">
                        {{ obj.label }}
                    </template>
                    <template slot-scope="scope">
                        {{ getVariantOptionValue(obj.id, scope.row) }}
                    </template>
                </el-table-column>

                <!-- price -->
                <el-table-column :label="$t('Price')">
                    <template slot-scope="scope">
                        <input-money
                            v-model="scope.row.price"
                            class="width125" />
                    </template>
                </el-table-column>

                <!-- quantity -->
                <el-table-column :label="$t('Quantity')">
                    <template slot-scope="scope">
                        <el-input-number
                            v-model="scope.row.quantity"
                            :step="1"
                            step-strictly
                            class="input-number" />
                    </template>
                </el-table-column>

                <!-- sku -->
                <el-table-column :label="$t('SKU')">
                    <template slot-scope="scope">
                        <el-input v-model="scope.row.sku" />
                    </template>
                </el-table-column>

                <!-- sku -->
                <el-table-column :label="$t('Barcode')">
                    <template slot-scope="scope">
                        <el-input v-model="scope.row.barcode" />
                    </template>
                </el-table-column>
            </el-table>

        </div>

    </div>
</template>


<style lang="scss">
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
    width: 140px;
}
</style>
