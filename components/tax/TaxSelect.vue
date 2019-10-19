<script>
import tax_mixin from '@/mixins/tax_mixin';

export default {
    props: {
        value: {
            type: String
        }
    },

    mixins: [
        tax_mixin
    ],

    data: function() {
        return {
            taxes: [],
            selectedVal: null
        }
    },

    methods: {
        emitChange(val) {
            this.$emit('input', val)
        },

        async fetchTaxes() {
            this.taxes = await this.taxmix_search({
                orderBy: 'name',
                orderDir: 'ASC'
            });
        }
    },

    created() {
        this.fetchTaxes();
    },

    watch: {
        value: {
            handler(newVal) {
                this.selectedVal = newVal;
            },
            immediate: true,
        }
    }
}
</script>


<template>
    <el-select
        v-model="selectedVal"
        @change="emitChange"
        @clear="() => { selectedVal = null }"
        class="widthAll"
        :no-match-text="$t('No matching values')"
        :clearable="true">
        <el-option
            v-for="item in taxes"
            :key="item.id"
            :label="item.name"
            :value="item.id">
            <span style="float: left">{{ item.name }}</span>
            <span style="float: right; color: #8492a6; font-size: 13px">{{ item.percentage }}%</span>
        </el-option>
    </el-select>
</template>
