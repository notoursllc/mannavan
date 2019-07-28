<script>
export default {
    props: {
        value: {},

        rates: {
            type: Array,
            required: false
        }
    },

    data: function() {
        return {
            selectedRate: null
        }
    },

    methods: {
        handleTableRowSelect(val) {
            this.selectedRate = val;
        },

        selectTableRow(row) {
            this.$refs.ratesTable.setCurrentRow(row);
        }
    },

    created: function() {
        this.$watch('value', val => {
            if(val) {
                // console.log("selectedRate", val);
                this.selectTableRow(val);
            }
        });

        this.$watch('selectedRate', val => {
            this.$emit('input', val)
        });
    }
}
</script>

<template>
    <el-table
        ref="ratesTable"
        :data="rates"
        highlight-current-row
        @current-change="handleTableRowSelect"
        class="widthAll">
        <el-table-column width="55">
            <template slot-scope="scope">
                <el-radio v-model="selectedRate" :label="scope.row">&nbsp;</el-radio>
            </template>
        </el-table-column>

        <!-- estimated days -->
        <el-table-column
            prop="estimated_days"
            label="Estimated delivery">
            <template slot-scope="scope">
                {{ `${scope.row.estimated_days} ${$tc('day_days', scope.row.estimated_days)}` }}
            </template>
        </el-table-column>

        <!-- price -->
        <el-table-column
            prop="amount"
            label="Amount"
            width="100">
            <template slot-scope="scope">
                {{ $n(scope.row.amount, 'currency') }}
            </template>
        </el-table-column>
    </el-table>
</template>
