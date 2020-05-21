<script>
export default {
    name: 'QuantityButton',

    props: {
        value: {
            type: Number,
            default: 1
        },

        buttonType: {
            type: String,
            default: 'success'
        },

        max: {
            type: Number,
            default: 10
        }
    },

    data: function() {
        return {
            selectedQty: 1
        };
    },

    computed: {
        selectOptions() {
            const opts = [];
            for(let i = 1; i <= this.max; i++) {
                opts.push(i);
            }
            return opts;
        }
    },

    watch: {
        value: {
            handler(newVal) {
                this.selectedQty = newVal;
            },
            immediate: true
        }
    },

    methods: {
        onQtyChange(val) {
            this.$emit('input', this.selectedQty);
        },

        onButtonClick() {
            this.$emit('click');
        }
    }
};
</script>


<template>
    <div
        class="qty-button"
        :class="[
            buttonType ? 'qty-button-' + buttonType : ''
        ]">
        <el-select
            v-model="selectedQty"
            @input="onQtyChange">
            <el-option
                v-for="num in selectOptions"
                :key="num"
                :label="num"
                :value="num"></el-option>
        </el-select>
        <el-button
            :type="buttonType"
            @click="onButtonClick"><slot></slot></el-button>
    </div>
</template>


<style lang="scss">
@import "~assets/css/components/_mixins.scss";

.qty-button {
    display: inline-block;
    border-color: #909399;
    border-style: solid;
    border-width: 1px;
    @include border-radius(4px);

    .el-select {
        width: 65px;
        vertical-align: middle;

        .el-input__inner {
            border: 0;
        }
    }

    .el-button {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
        padding: 20px;
    }
}

.qty-button-success { border-color: #67C23A }
.qty-button-primary { border-color: #409eff; }
.qty-button-warning { border-color: #e6a23c }
.qty-button-danger { border-color: #f56c6c }
</style>
