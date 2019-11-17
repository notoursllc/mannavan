<script>
import isObject from 'lodash.isobject';
import cloneDeep from 'lodash.clonedeep';
import isString from 'lodash.isstring';

export default {
    name: 'AttributeBuilder',

    props: {
        value: {
            type: Array
        },

        suggestions: {
            type: Array
        },

        maxCount: {
            type: Number
        }
    },

    data: function() {
        return {
            attrs: []
        }
    },

    computed: {
        reachedMaxCount() {
            if(this.maxCount) {
                return this.maxCount <= this.attrs.length;
            }
            return false;
        }
    },

    methods: {
        emitInput() {
            const attrs = [];
            this.attrs.forEach((obj) => {
                attrs.push(obj.label);
            })

            this.$emit('input', attrs);
        },

        onInputChange() {
            this.emitInput();
        },

        onClickDeleteRow(index) {
            this.attrs.splice(index, 1);
            this.emitInput();
        },

        addNewItem() {
            let suggestions = Array.isArray(this.suggestions) ? this.suggestions.slice(0) : [];  // copy the array

            if(suggestions.length) {
                let i = this.attrs.length;
                while (i--) {
                    if(suggestions.indexOf(this.attrs[i].label) > -1) {
                        suggestions.splice(suggestions.indexOf(this.attrs[i].label), 1);
                    }
                }

                this.attrs.push(
                    { label: suggestions[0] || null }
                );
            }
            else {
                this.attrs.push(
                    { label: null }
                );
            }

            this.emitInput();
        }
    },

    watch: {
        maxCount: {
            handler(newVal) {
                // if the new value is less than the current
                // number of attributes, then we trim the array
                let numAttrs = this.attrs.length;

                if(newVal && numAttrs > newVal) {
                    for(let i=numAttrs; i>newVal; i--) {
                        this.attrs.splice(i-1, 1)
                    }
                    this.emitInput();
                }
            },
            immediate: true,
        },

        value: {
            handler(newVal) {
                if(Array.isArray(newVal)) {
                    const attrs = [];
                    newVal.forEach((item) => {
                        attrs.push({
                            label: item
                        })
                    })
                    this.attrs = attrs;
                }
            },
            immediate: true,
        }
    }
}
</script>


<template>
    <div>
        <div class="option-row" v-for="(obj, index) in attrs" :key="index">
            <div class="option-row-input">
                <el-input
                    v-model="obj.label"
                    size="small"
                    placeholder="Option name"
                    class="widthAll"
                    @input="onInputChange" />
            </div>

            <div class="option-row-btn">
                <el-button
                    @click="onClickDeleteRow(index)"
                    type="text"
                    class="mlm"
                    size="small">{{ $t('Delete') }}</el-button>
            </div>
        </div>

        <div class="mtm" v-if="!reachedMaxCount">
            <el-button
                @click="addNewItem"
                type="primary"
                size="small">{{ $t('New option') }}</el-button>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import "~assets/css/components/_mixins.scss";

.option-row {
    @include flexbox();
    @include flex-direction(row);

    .option-row-input {
        @include flex(1 1 auto);
        @include align-items(flex-start);
        padding: 2px 5px 2px 0;
    }

    .option-row-btn {
        @include flex(0);
        padding: 2px 5px 2px 0;
    }
}
</style>
