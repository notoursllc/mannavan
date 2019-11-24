<script>
import isObject from 'lodash.isobject';
import cloneDeep from 'lodash.clonedeep';


/**
 * Maps the option.values into variant groups
 *
 * @example
 * Converts this:
 * [ { "label": "Size", "values": [ "a" ] }, { "label": "Color", "values": [ "b", "c" ] }, { "label": "Material", "values": [ "e" ] } ]
 *
 * Into this:
 * [ [ "a", "b", "e" ], [ "a", "c", "e" ] ]
 */
function makeVariants(arr, currentIndex, allArrays) {
    let arr2 = allArrays[currentIndex + 1];

    // turn all arr values into an array
    let cleanArr = [];
    if(Array.isArray(arr)) {
        // all of the array values need to be arrays
        arr.forEach((val, index) => {
            cleanArr[index] = !Array.isArray(val) ? [val] : val;
        });

        if(Array.isArray(arr2)) {
            let mappings = [];

            cleanArr.forEach((arr1Value) => {
                let group = [];
                let v = !Array.isArray(arr1Value) ? [arr1Value] : arr1Value;

                arr2.map((val) => {
                    let fresh = [].concat(v);
                    fresh.push(val);
                    mappings.push(fresh)
                })
            });

            return makeVariants(mappings, currentIndex + 1, allArrays);
        }
    }

    return cleanArr;
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
        ProductOptionValueSelect: () => import('@/components/product/admin/ProductOptionValueSelect')
    },

    data: function() {
        return {
            options: []
        }
    },

    computed: {
        canAddOption() {
            return this.options.length < this.maxCount;
        },

        variants() {
            let allValues = [];

            this.options.forEach((obj) => {
                if(Array.isArray(obj.values) && obj.values.length) {
                    allValues.push( obj.values );
                }
            });

            return makeVariants(allValues[0], 0, allValues)

        },

        // variants() {
        //     let allValues = this.options.map(obj => obj.values);

        //     function mapArrays(arr, currentIndex) {
        //         let arr2 = allValues[currentIndex + 1];

        //         if(Array.isArray(arr) && Array.isArray(arr2)) {
        //             let mappings = [];

        //             arr.forEach((arr1Value) => {
        //                  mappings = mappings.concat(arr2.map(val => arr1Value + '-' + val))
        //             });

        //             return mapArrays(mappings, currentIndex + 1);
        //         }

        //         return arr;
        //     }

        //     return mapArrays(allValues[0], 0)
        // }
    },

    methods: {
        emitInput() {
            const attrs = [];
            this.options.forEach((obj) => {
                attrs.push(obj.label);
            })

            this.$emit('input', attrs);
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
                        type: 'OPTION_TYPE_SELECT_ONE'
                    }
                );
            }
            else {
                this.options.push(
                    {
                        label: null,
                        values: [],
                        type: 'OPTION_TYPE_SELECT_ONE'
                    }
                );
            }
        },

        onClickDeleteRow(index) {
            this.options.splice(index, 1);
            this.emitInput();
        }
    },
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

        <div class="sku-preview" v-show="options.length">
            <h4>{{ $t('Preview') }}</h4>

            <table class="table mtm">
                <tr>
                    <th>{{ $t('Variant') }}</th>
                    <th>{{ $t('Price') }}</th>
                    <th>{{ $t('Quantity') }}</th>
                    <th>{{ $t('SKU') }}</th>
                    <th>{{ $t('Barcode') }}</th>
                    <th></th>
                </tr>
                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
            </table>

            {{ variants }}
        </div>

    </div>
</template>


<style lang="scss">
.sku-preview {
    margin-top: 20px;

    h4 {
        font-weight: 500;
    }
}
</style>
