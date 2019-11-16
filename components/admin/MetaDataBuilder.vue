<script>
import isObject from 'lodash.isobject';
import cloneDeep from 'lodash.clonedeep';

export default{
    props: {
        value: {
            type: Object
        }
    },

    data: function() {
        return {
            newdata: []
        }
    },

    methods: {
        emitInput() {
            if(!this.newdata.length) {
                this.$emit('input', null);
                return;
            }

            this.$emit('input', {
                data: cloneDeep(this.newdata)
            });
        },

        sanitize() {
            let i = this.newdata.length;
            while (i--) {
                if(!this.newdata[i].property && !this.newdata[i].value) {
                    this.newdata.splice(i, 1);
                }
            }
        },

        addIfEmpty() {
            if(!this.newdata.length) {
                this.addNewItem();
            }
        },

        onInputChange() {
            console.log("onInputChange");
            this.sanitize();
            this.emitInput();
            this.addIfEmpty();
        },

        onClickDeleteRow(index) {
            this.newdata.splice(index, 1);

            this.sanitize();
            this.emitInput();
            this.addIfEmpty();
        },

        addNewItem() {
            this.newdata.push(
                { property: null, value: null }
            )
        }
    },

    created() {
        this.addNewItem();
    },

    watch: {
        value: {
            handler(newVal) {
                if(isObject(newVal) && newVal.hasOwnProperty('data')) {
                    this.newdata = cloneDeep(newVal.data);
                }
            },
            immediate: true,
        }
    }
}
</script>


<template>
    <div>
        <div class="metaDataHeader">
            <div class="meta-row" v-for="(obj, index) in newdata" :key="index">
                <div class="meta-row-fields">
                    <div class="meta-row-property">
                        <el-input
                            v-model="obj.property"
                            size="small"
                            @input="onInputChange" />
                    </div>

                    <div class="meta-row-value">
                        <el-input
                            v-model="obj.value"
                            size="small"
                            @input="onInputChange" />

                        <el-button
                            @click="onClickDeleteRow(index)"
                            class="mlm"
                            size="small"
                            type="text">Delete</el-button>
                    </div>
                </div>
            </div>
        </div>

        <div class="metaDataFooter">
            <el-button @click="addNewItem" size="small">New Item</el-button>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import "~assets/css/components/_mixins.scss";

.metaDataHeader {
    .meta-row {
        @include flexbox();
        @include flex-direction(column);
    }
    .meta-row-fields {
        @include flexbox();
    }
    .meta-row-property {
        @include flex(0 0 180px);
        padding: 2px 5px 2px 0;
    }
    .meta-row-value {
        @include flexbox();
        @include flex(1 1 auto);
        @include align-items(flex-start);
        padding: 2px 5px 2px 0;
    }
}

.metaDataFooter {
    padding-top: 5px;
    text-align: left;
}
</style>
