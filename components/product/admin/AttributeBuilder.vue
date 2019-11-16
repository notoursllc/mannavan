<script>
import isObject from 'lodash.isobject';
import cloneDeep from 'lodash.clonedeep';

export default {
    name: 'AttributeBuilder',

    props: {
        value: {
            type: Object
        }
    },

    data: function() {
        return {
            attrs: []
        }
    },

    methods: {
        emitInput() {
            if(!this.attrs.length) {
                this.$emit('input', null);
                return;
            }

            this.$emit('input', {
                data: cloneDeep(this.attrs)
            });
        },

        sanitize() {
            let i = this.attrs.length;
            while (i--) {
                if(!this.attrs[i].label) {
                    this.attrs.splice(i, 1);
                }
            }
        },

        addIfEmpty() {
            if(!this.attrs.length) {
                this.addNewItem();
            }
        },

        onInputChange() {
            this.sanitize();
            this.addIfEmpty();
            this.emitInput();
        },

        onClickDeleteRow(index) {
            this.attrs.splice(index, 1);

            this.sanitize();
            this.addIfEmpty();
            this.emitInput();
        },

        addNewItem() {
            let labels = ['Size', 'Color', 'Material'];

            let i = this.attrs.length;
            while (i--) {
                if(labels.indexOf(this.attrs[i].label) > -1) {
                    labels.splice(labels.indexOf(this.attrs[i].label), 1);
                }
            }

            this.attrs.push(
                { label: labels[0] || null }
            );

            this.emitInput();
        }
    },

    watch: {
        value: {
            handler(newVal) {
                if(isObject(newVal) && newVal.hasOwnProperty('data')) {
                    this.attrs = cloneDeep(newVal.data);
                }
            },
            immediate: true,
        }
    }
}
</script>


<template>
    <div>
        <div class="optionRow" v-for="(obj, index) in attrs" :key="index">
            <el-input
                v-model="obj.label"
                size="small"
                placeholder="Option name"
                @input="onInputChange" />

            <el-button
                @click="onClickDeleteRow(index)"
                type="text"
                class="mlm"
                size="small">Delete</el-button>
        </div>

        <div class="mtm">
            <el-button
                @click="addNewItem"
                type="primary"
                size="small">New Option</el-button>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.optionRow {
    .el-input {
        width: 200px;
        margin-bottom: 5px;
    }
}
</style>
