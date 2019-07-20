<script>
import product_mixin from '@/mixins/product_mixin'


export default{
    props: {
        value: {
            type: String,
            default: ''
        }
    },

    mixins: [
        product_mixin
    ],

    data: function() {
        return {
            artists: [],
            selectedArtist: null
        }
    },

    methods: {
        emitChange(val) {
            this.$emit('input', val)
        },

        async fetchArtists() {
            this.artists = await this.getProductArtists({
                orderBy: 'name',
                orderDir: 'ASC'
            });
        },
    },

    async created() {
        this.fetchArtists();
    },

    watch: {
        'value' (to, from) {
            this.selectedArtist = to;
        }
    },
}
</script>


<template>
    <el-select
        v-model="selectedArtist"
        @change="emitChange"
        class="widthAll"
        filterable
        :no-match-text="$t('No matching values')">
        <el-option
            v-for="obj in artists"
            :key="obj.id"
            :label="obj.name"
            :value="obj.id">
        </el-option>
    </el-select>
</template>
