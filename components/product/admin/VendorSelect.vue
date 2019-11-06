<script>
export default {
    name: 'VendorSelect',

    props: {
        value: {
            type: String,
            default: ''
        }
    },

    data: function() {
        return {
            vendors: [],
            selected: null
        }
    },

    methods: {
        emitChange(val) {
            this.$emit('input', val)
        },

        async fetchVendors() {
            this.vendors = await this.$api.vendors.list({
                orderBy: 'name',
                orderDir: 'ASC'
            });
        },
    },

    async created() {
        this.fetchVendors();
    },

    watch: {
        'value' (to, from) {
            this.selected = to;
        }
    },
}
</script>


<template>
    <el-select
        v-model="selected"
        @change="emitChange"
        @clear="() => { selected = null }"
        class="widthAll"
        filterable
        :no-match-text="$t('No matching values')"
        :clearable="true"
        placeholder="">
        <el-option
            v-for="obj in vendors"
            :key="obj.id"
            :label="obj.name"
            :value="obj.id">
        </el-option>
    </el-select>
</template>
