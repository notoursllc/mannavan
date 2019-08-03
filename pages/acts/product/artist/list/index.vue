<script>
import product_mixin from '@/mixins/product_mixin'

export default {
    middleware: [
        'authenticated'
    ],

    layout: 'admin',

    components: {
        OperationsDropdown: () => import('@/components/OperationsDropdown'),
        Fab: () => import('@/components/Fab')
    },

    mixins: [
        product_mixin
    ],

    data() {
        return {
            artists: [],
            sortData: {
                orderBy: 'updated_at',
                orderDir: 'DESC'
            }
        }
    },

    async asyncData({ params, store, app }) {
        const artists = await product_mixin.methods.getProductArtists.call(app, {
            // where: ['is_available', '=', true],
            // andWhere: [
            //     ['total_inventory_count', '>', 0]
            // ],
            orderBy: 'updated_at',
            orderDir: 'DESC'
        });

        return {
            artists
        }
    },

    methods: {
        async fetchArtists() {
            this.artists = await this.getProductArtists({
                // where: ['is_available', '=', true],
                // whereRaw: ['sub_type & ? > 0', [productTypeId]],
                // andWhere: [
                //     ['total_inventory_count', '>', 0]
                // ],
                ...this.sortData
            });
        },

        sortChanged(val) {
            this.sortData.orderBy = val.prop || 'updated_at';
            this.sortData.orderDir = val.order === 'ascending' ? 'ASC' : 'DESC';
            this.fetchArtists();
        },

        async deleteArtist(id, name) {
            try {
                await this.$confirm(`Delete "${ name || id }"?`, 'Please confirm', {
                    confirmButtonText: 'OK',
                    cancelButtonText: 'Cancel',
                    type: 'warning'
                });

                let resposne = await this.getProductsForArtist(id);

                // Don't delete the artist if it is related to any products
                if(resposne.pagination.rowCount) {
                    this.$errorMessage(
                        `"${ name || id }" can not be deleted because the artist is assigned to ${resposne.pagination.rowCount} products`,
                    );
                    return;
                }

                await this.deleteProductArtist(id);
                this.$successMessage(`"${ name || id }" deleted successfully`);
                this.fetchArtists();
            }
            catch(err) {
                // Do nothing
            }
        }
    }
}
</script>


<template>
    <div>
        <fab type="add" @click="goToProductArtistUpsert" />

        <div class="pbl">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item :to="{ name: 'acts-product-artist-list' }">Product Artists</el-breadcrumb-item>
            </el-breadcrumb>
        </div>

        <el-table
            :data="artists"
            class="widthAll"
            @sort-change="sortChanged">

            <el-table-column type="expand">
                <template slot-scope="scope">
                    <pre style="overflow-x:scroll">{{ scope.row | formatJson }}</pre>
                </template>
            </el-table-column>

            <!-- name -->
            <el-table-column
                prop="name"
                label="Name"
                sortable="custom">
                <template slot-scope="scope">
                    {{ scope.row.name }}
                    <operations-dropdown
                        :show-view="false"
                        @edit="goToProductArtistUpsert(scope.row.id)"
                        @delete="deleteArtist(scope.row.id, scope.row.name)" />
                </template>
            </el-table-column>

            <!-- email -->
            <el-table-column
                prop="email"
                label="Email"
                sortable="custom">
                <template slot-scope="scope">
                    <div>{{ scope.row.email }}</div>
                </template>
            </el-table-column>

            <!-- description short -->
            <el-table-column
                prop="description_short"
                label="Short Description">
            </el-table-column>
        </el-table>
    </div>
</template>


<style lang="scss">
    @import "~assets/css/components/_table.scss";
</style>
